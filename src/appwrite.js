export default function () {

        let config = {
            endpoint: 'https://appwrite.io/v1',
            endpointRealtime: '',
            project: '',
            key: '',
            locale: '',
            mode: '',
        };

        /**
         * @param {string} endpoint
         * @returns {this}
         */
        let setEndpoint = function(endpoint) {
            config.endpoint = endpoint;
            config.endpointRealtime = 
                config.endpointRealtime || 
                endpoint.replace("https://", "wss://").replace("http://", "ws://");

            return this;
        };

        /**
         * @param {string} endpointRealtime
         * @returns {this}
         */
        let setEndpointRealtime = function(endpointRealtime) {
            config.endpointRealtime = endpointRealtime;

            return this;
        };

        /**
         * Set Project
         *
         * Your project ID
         *
         * @param value string
         *
         * @return this
         */
        let setProject = function (value)
        {
            http.addGlobalHeader('X-Appwrite-Project', value);

            config.project = value;

            return this;
        };

        /**
         * Set Key
         *
         * Your secret API key
         *
         * @param value string
         *
         * @return this
         */
        let setKey = function (value)
        {
            http.addGlobalHeader('X-Appwrite-Key', value);

            config.key = value;

            return this;
        };

        /**
         * Set Locale
         *
         * @param value string
         *
         * @return this
         */
        let setLocale = function (value)
        {
            http.addGlobalHeader('X-Appwrite-Locale', value);

            config.locale = value;

            return this;
        };

        /**
         * Set Mode
         *
         * @param value string
         *
         * @return this
         */
        let setMode = function (value)
        {
            http.addGlobalHeader('X-Appwrite-Mode', value);

            config.mode = value;

            return this;
        };

        let http = function(document) {
            let globalParams    = [],
                globalHeaders   = [];

            let addParam = function (url, param, value) {
                let a = document.createElement('a'), regex = /(?:\?|&amp;|&)+([^=]+)(?:=([^&]*))*/g;
                let match, str = [];
                a.href = url;
                param = encodeURIComponent(param);

                while (match = regex.exec(a.search)) if (param !== match[1]) str.push(match[1] + (match[2] ? "=" + match[2] : ""));

                str.push(param + (value ? "=" + encodeURIComponent(value) : ""));

                a.search = str.join("&");

                return a.href;
            };

            /**
             * @param {Object} params
             * @returns {string}
             */
            let buildQuery = function(params) {
                let str = [];

                for (let p in params) {
                    if(Array.isArray(params[p])) {
                        for (let index = 0; index < params[p].length; index++) {
                            let param = params[p][index];
                            str.push(encodeURIComponent(p + '[]') + "=" + encodeURIComponent(param));
                        }
                    }
                    else {
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(params[p]));
                    }
                }

                return str.join("&");
            };

            let addGlobalHeader = function(key, value) {
                globalHeaders[key] = {key: key.toLowerCase(), value: value.toLowerCase()};
            };
            
            let addGlobalParam = function(key, value) {
                globalParams.push({key: key, value: value});
            };

            addGlobalHeader('x-sdk-version', 'appwrite:web:0.0.0');
            addGlobalHeader('content-type', '');
            addGlobalHeader('X-Appwrite-Response-Format', '0.7.0');
    
            /**
             * @param {string} method
             * @param {string} path string
             * @param {Object} headers
             * @param {Object} params
             * @param {function} progress
             * @returns {Promise}
             */
            let call = function (method, path, headers = {}, params = {}, progress = null) {
                let i;

                path = config.endpoint + path;

                if (-1 === ['GET', 'POST', 'PUT', 'DELETE', 'TRACE', 'HEAD', 'OPTIONS', 'CONNECT', 'PATCH'].indexOf(method)) {
                    throw new Error('var method must contain a valid HTTP method name');
                }

                if (typeof path !== 'string') {
                    throw new Error('var path must be of type string');
                }

                if (typeof headers !== 'object') {
                    throw new Error('var headers must be of type object');
                }

                for (i = 0; i < globalParams.length; i++) { // Add global params to URL
                    path = addParam(path, globalParams[i].key, globalParams[i].value);
                }

                if(window.localStorage && window.localStorage.getItem('cookieFallback')) {
                    headers['X-Fallback-Cookies'] = window.localStorage.getItem('cookieFallback');
                }

                for (let key in globalHeaders) { // Add Global Headers
                    if (globalHeaders.hasOwnProperty(key)) {
                        if (!headers[globalHeaders[key].key]) {
                            headers[globalHeaders[key].key] = globalHeaders[key].value;
                        }
                    }
                }

                if(method === 'GET') {
                    for (let param in params) {
                        if (param.hasOwnProperty(key)) {
                            path = addParam(path, key + (Array.isArray(param) ? '[]' : ''), params[key]);
                        }
                    }
                }

                switch (headers['content-type']) { // Parse request by content type
                    case 'application/json':
                        params = JSON.stringify(params);
                    break;

                    case 'multipart/form-data':
                        let formData = new FormData();

                        Object.keys(params).forEach(function(key) {
                            let param = params[key];
                            formData.append(key + (Array.isArray(param) ? '[]' : ''), param);
                        });

                        params = formData;
                    break;
                }

                return new Promise(function (resolve, reject) {

                    let request = new XMLHttpRequest(), key;

                    request.withCredentials = true;
                    request.open(method, path, true);

                    for (key in headers) { // Set Headers
                        if (headers.hasOwnProperty(key)) {
                            if (key === 'content-type' && headers[key] === 'multipart/form-data') { // Skip to avoid missing boundary
                                continue;
                            }

                            request.setRequestHeader(key, headers[key]);
                        }
                    }

                    request.onload = function () {
                        let data = request.response;
                        let contentType = this.getResponseHeader('content-type') || '';
                        contentType = contentType.substring(0, contentType.indexOf(';'));

                        switch (contentType) {
                            case 'application/json':
                                data = JSON.parse(data);
                                break;
                        }

                        let cookieFallback = this.getResponseHeader('X-Fallback-Cookies') || '';
                        
                        if(window.localStorage && cookieFallback) {
                            window.console.warn('Appwrite is using localStorage for session management. Increase your security by adding a custom domain as your API endpoint.');
                            window.localStorage.setItem('cookieFallback', cookieFallback);
                        }

                        if (4 === request.readyState && 399 >= request.status) {
                            resolve(data);
                        } else {
                            reject(data);
                        }
                    };

                    if (progress) {
                        request.addEventListener('progress', progress);
                        request.upload.addEventListener('progress', progress, false);
                    }

                    // Handle network errors
                    request.onerror = function () {
                        reject(new Error("Network Error"));
                    };

                    request.send(params);
                })
            };

            return {
                'get': function(path, headers = {}, params = {}) {
                    return call('GET', path + ((Object.keys(params).length > 0) ? '?' + buildQuery(params) : ''), headers, {});
                },
                'post': function(path, headers = {}, params = {}, progress = null) {
                    return call('POST', path, headers, params, progress);
                },
                'put': function(path, headers = {}, params = {}, progress = null) {
                    return call('PUT', path, headers, params, progress);
                },
                'patch': function(path, headers = {}, params = {}, progress = null) {
                    return call('PATCH', path, headers, params, progress);
                },
                'delete': function(path, headers = {}, params = {}, progress = null) {
                    return call('DELETE', path, headers, params, progress);
                },
                'addGlobalParam': addGlobalParam,
                'addGlobalHeader': addGlobalHeader
            }
        }(window.document);

        let realtime = {
            /** @type {WebSocket}  */
            socket: null,
            timeout: null,
            channels: {},
            lastMessage: {},
            createSocket: () => {
                const channels = new URLSearchParams();
                channels.set('project', config.project);
                for (const property in realtime.channels) {
                    channels.append('channels[]', property);
                }
                if (realtime.socket && realtime.socket.readyState && realtime.socket.readyState === WebSocket.OPEN) {
                    realtime.socket.close();
                }

                realtime.socket = new WebSocket(config.endpointRealtime + '/realtime?' + channels.toString());

                for (const channel in realtime.channels) {
                    realtime.channels[channel].forEach(callback => {
                        realtime.socket.addEventListener('message', callback);
                    });
                }

                realtime.socket.addEventListener('close', event => {
                    if (realtime.lastMessage.code && realtime.lastMessage.code === 1008) {
                        return;
                    }
                    console.error('Realtime got disconnected. Reconnect will be attempted in 1 second.', event.reason);
                    setTimeout(() => {
                        realtime.createSocket();
                    }, 1000);
                })
            },
            onMessage: (channel, callback) =>
                (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        realtime.lastMessage = data;

                        if (data.channels && data.channels.includes(channel)) {
                            callback(data);
                        } else if (data.code) {
                            throw data;
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }
        };

        /**
         * Subscribes to Appwrite events and passes you the payload in realtime.
         * 
         * @param {string|string[]} channels 
         * Channel to subscribe - pass a single channel as a string or multiple with an array of strings.
         * 
         * Possible channels are:
         * - account
         * - collections
         * - collections.[ID]
         * - collections.[ID].documents
         * - documents
         * - documents.[ID]
         * - files
         * - files.[ID]
         * @param {(payload: object) => void} callback Is called on every realtime update.
         * @returns {() => void} Unsubscribes from events.
         */
        let subscribe = (channels, callback) => {
            if (typeof channels === 'string' || channels instanceof String) {
                channels = [channels];
            } else if (!(channels instanceof Array)) {
                throw Error("Channels must be of type String or Array.");
            }
            channels.forEach((channel, index) => {
                if (!(channel in realtime.channels)) {
                    realtime.channels[channel] = [];
                }
                channels[index] = {name: channel, index: (realtime.channels[channel].push(realtime.onMessage(channel, callback)) - 1)};
                clearTimeout(realtime.timeout);
                realtime.timeout = setTimeout(() => {
                    realtime.createSocket();
                }, 1);
            });

            return () => {
                channels.forEach(channel => {
                    realtime.socket.removeEventListener('message', realtime.channels[channel.name][channel.index]);
                    realtime.channels[channel.name].splice(channel.index, 1);
                })
            }
        };

        let database = {

            /**
             * List Collections
             *
             * Get a list of all the user collections. You can use the query params to
             * filter your results. On admin mode, this endpoint will return a list of all
             * of the project's collections. [Learn more about different API
             * modes](/docs/admin).
             *
             * @param {string} search
             * @param {number} limit
             * @param {number} offset
             * @param {string} orderType
             * @throws {Error}
             * @return {Promise}             
             */
            listCollections: function(search = '', limit = 25, offset = 0, orderType = 'ASC') {
                let path = '/database/collections';

                let payload = {};

                if(search) {
                    payload['search'] = search;
                }

                if(limit) {
                    payload['limit'] = limit;
                }

                if(offset) {
                    payload['offset'] = offset;
                }

                if(orderType) {
                    payload['orderType'] = orderType;
                }

                return http
                    .get(path, {
                        'content-type': 'application/json',
                    }, payload);
            },

            /**
             * Create Collection
             *
             * Create a new Collection.
             *
             * @param {string} name
             * @param {string[]} read
             * @param {string[]} write
             * @param {string[]} rules
             * @throws {Error}
             * @return {Promise}             
             */
            createCollection: function(name, read, write, rules) {
                if(name === undefined) {
                    throw new Error('Missing required parameter: "name"');
                }
                
                if(read === undefined) {
                    throw new Error('Missing required parameter: "read"');
                }
                
                if(write === undefined) {
                    throw new Error('Missing required parameter: "write"');
                }
                
                if(rules === undefined) {
                    throw new Error('Missing required parameter: "rules"');
                }
                
                let path = '/database/collections';

                let payload = {};

                if(typeof name !== 'undefined') {
                    payload['name'] = name;
                }

                if(typeof read !== 'undefined') {
                    payload['read'] = read;
                }

                if(typeof write !== 'undefined') {
                    payload['write'] = write;
                }

                if(typeof rules !== 'undefined') {
                    payload['rules'] = rules;
                }

                return http
                    .post(path, {
                        'content-type': 'application/json',
                    }, payload);
            },

            /**
             * Get Collection
             *
             * Get a collection by its unique ID. This endpoint response returns a JSON
             * object with the collection metadata.
             *
             * @param {string} collectionId
             * @throws {Error}
             * @return {Promise}             
             */
            getCollection: function(collectionId) {
                if(collectionId === undefined) {
                    throw new Error('Missing required parameter: "collectionId"');
                }
                
                let path = '/database/collections/{collectionId}'.replace(new RegExp('{collectionId}', 'g'), collectionId);

                let payload = {};

                return http
                    .get(path, {
                        'content-type': 'application/json',
                    }, payload);
            },

            /**
             * Update Collection
             *
             * Update a collection by its unique ID.
             *
             * @param {string} collectionId
             * @param {string} name
             * @param {string[]} read
             * @param {string[]} write
             * @param {string[]} rules
             * @throws {Error}
             * @return {Promise}             
             */
            updateCollection: function(collectionId, name, read, write, rules = []) {
                if(collectionId === undefined) {
                    throw new Error('Missing required parameter: "collectionId"');
                }
                
                if(name === undefined) {
                    throw new Error('Missing required parameter: "name"');
                }
                
                if(read === undefined) {
                    throw new Error('Missing required parameter: "read"');
                }
                
                if(write === undefined) {
                    throw new Error('Missing required parameter: "write"');
                }
                
                let path = '/database/collections/{collectionId}'.replace(new RegExp('{collectionId}', 'g'), collectionId);

                let payload = {};

                if(typeof name !== 'undefined') {
                    payload['name'] = name;
                }

                if(typeof read !== 'undefined') {
                    payload['read'] = read;
                }

                if(typeof write !== 'undefined') {
                    payload['write'] = write;
                }

                if(typeof rules !== 'undefined') {
                    payload['rules'] = rules;
                }

                return http
                    .put(path, {
                        'content-type': 'application/json',
                    }, payload);
            },

            /**
             * Delete Collection
             *
             * Delete a collection by its unique ID. Only users with write permissions
             * have access to delete this resource.
             *
             * @param {string} collectionId
             * @throws {Error}
             * @return {Promise}             
             */
            deleteCollection: function(collectionId) {
                if(collectionId === undefined) {
                    throw new Error('Missing required parameter: "collectionId"');
                }
                
                let path = '/database/collections/{collectionId}'.replace(new RegExp('{collectionId}', 'g'), collectionId);

                let payload = {};

                return http
                    .delete(path, {
                        'content-type': 'application/json',
                    }, payload);
            },

            /**
             * List Documents
             *
             * Get a list of all the user documents. You can use the query params to
             * filter your results. On admin mode, this endpoint will return a list of all
             * of the project's documents. [Learn more about different API
             * modes](/docs/admin).
             *
             * @param {string} collectionId
             * @param {string[]} filters
             * @param {number} limit
             * @param {number} offset
             * @param {string} orderField
             * @param {string} orderType
             * @param {string} orderCast
             * @param {string} search
             * @throws {Error}
             * @return {Promise}             
             */
            listDocuments: function(collectionId, filters = [], limit = 25, offset = 0, orderField = '', orderType = 'ASC', orderCast = 'string', search = '') {
                if(collectionId === undefined) {
                    throw new Error('Missing required parameter: "collectionId"');
                }
                
                let path = '/database/collections/{collectionId}/documents'.replace(new RegExp('{collectionId}', 'g'), collectionId);

                let payload = {};

                if(filters) {
                    payload['filters'] = filters;
                }

                if(limit) {
                    payload['limit'] = limit;
                }

                if(offset) {
                    payload['offset'] = offset;
                }

                if(orderField) {
                    payload['orderField'] = orderField;
                }

                if(orderType) {
                    payload['orderType'] = orderType;
                }

                if(orderCast) {
                    payload['orderCast'] = orderCast;
                }

                if(search) {
                    payload['search'] = search;
                }

                return http
                    .get(path, {
                        'content-type': 'application/json',
                    }, payload);
            },

            /**
             * Create Document
             *
             * Create a new Document. Before using this route, you should create a new
             * collection resource using either a [server
             * integration](/docs/server/database#databaseCreateCollection) API or
             * directly from your database console.
             *
             * @param {string} collectionId
             * @param {object} data
             * @param {string[]} read
             * @param {string[]} write
             * @param {string} parentDocument
             * @param {string} parentProperty
             * @param {string} parentPropertyType
             * @throws {Error}
             * @return {Promise}             
             */
            createDocument: function(collectionId, data, read, write, parentDocument = '', parentProperty = '', parentPropertyType = 'assign') {
                if(collectionId === undefined) {
                    throw new Error('Missing required parameter: "collectionId"');
                }
                
                if(data === undefined) {
                    throw new Error('Missing required parameter: "data"');
                }
                
                if(read === undefined) {
                    throw new Error('Missing required parameter: "read"');
                }
                
                if(write === undefined) {
                    throw new Error('Missing required parameter: "write"');
                }
                
                let path = '/database/collections/{collectionId}/documents'.replace(new RegExp('{collectionId}', 'g'), collectionId);

                let payload = {};

                if(typeof data !== 'undefined') {
                    payload['data'] = data;
                }

                if(typeof read !== 'undefined') {
                    payload['read'] = read;
                }

                if(typeof write !== 'undefined') {
                    payload['write'] = write;
                }

                if(typeof parentDocument !== 'undefined') {
                    payload['parentDocument'] = parentDocument;
                }

                if(typeof parentProperty !== 'undefined') {
                    payload['parentProperty'] = parentProperty;
                }

                if(typeof parentPropertyType !== 'undefined') {
                    payload['parentPropertyType'] = parentPropertyType;
                }

                return http
                    .post(path, {
                        'content-type': 'application/json',
                    }, payload);
            },

            /**
             * Get Document
             *
             * Get a document by its unique ID. This endpoint response returns a JSON
             * object with the document data.
             *
             * @param {string} collectionId
             * @param {string} documentId
             * @throws {Error}
             * @return {Promise}             
             */
            getDocument: function(collectionId, documentId) {
                if(collectionId === undefined) {
                    throw new Error('Missing required parameter: "collectionId"');
                }
                
                if(documentId === undefined) {
                    throw new Error('Missing required parameter: "documentId"');
                }
                
                let path = '/database/collections/{collectionId}/documents/{documentId}'.replace(new RegExp('{collectionId}', 'g'), collectionId).replace(new RegExp('{documentId}', 'g'), documentId);

                let payload = {};

                return http
                    .get(path, {
                        'content-type': 'application/json',
                    }, payload);
            },

            /**
             * Update Document
             *
             * Update a document by its unique ID. Using the patch method you can pass
             * only specific fields that will get updated.
             *
             * @param {string} collectionId
             * @param {string} documentId
             * @param {object} data
             * @param {string[]} read
             * @param {string[]} write
             * @throws {Error}
             * @return {Promise}             
             */
            updateDocument: function(collectionId, documentId, data, read, write) {
                if(collectionId === undefined) {
                    throw new Error('Missing required parameter: "collectionId"');
                }
                
                if(documentId === undefined) {
                    throw new Error('Missing required parameter: "documentId"');
                }
                
                if(data === undefined) {
                    throw new Error('Missing required parameter: "data"');
                }
                
                if(read === undefined) {
                    throw new Error('Missing required parameter: "read"');
                }
                
                if(write === undefined) {
                    throw new Error('Missing required parameter: "write"');
                }
                
                let path = '/database/collections/{collectionId}/documents/{documentId}'.replace(new RegExp('{collectionId}', 'g'), collectionId).replace(new RegExp('{documentId}', 'g'), documentId);

                let payload = {};

                if(typeof data !== 'undefined') {
                    payload['data'] = data;
                }

                if(typeof read !== 'undefined') {
                    payload['read'] = read;
                }

                if(typeof write !== 'undefined') {
                    payload['write'] = write;
                }

                return http
                    .patch(path, {
                        'content-type': 'application/json',
                    }, payload);
            },

            /**
             * Delete Document
             *
             * Delete a document by its unique ID. This endpoint deletes only the parent
             * documents, its attributes and relations to other documents. Child documents
             * **will not** be deleted.
             *
             * @param {string} collectionId
             * @param {string} documentId
             * @throws {Error}
             * @return {Promise}             
             */
            deleteDocument: function(collectionId, documentId) {
                if(collectionId === undefined) {
                    throw new Error('Missing required parameter: "collectionId"');
                }
                
                if(documentId === undefined) {
                    throw new Error('Missing required parameter: "documentId"');
                }
                
                let path = '/database/collections/{collectionId}/documents/{documentId}'.replace(new RegExp('{collectionId}', 'g'), collectionId).replace(new RegExp('{documentId}', 'g'), documentId);

                let payload = {};

                return http
                    .delete(path, {
                        'content-type': 'application/json',
                    }, payload);
            }
        };

        return {
            setEndpoint: setEndpoint,
            setEndpointRealtime: setEndpointRealtime,
            setProject: setProject,
            setKey: setKey,
            setLocale: setLocale,
            setMode: setMode,
            subscribe: subscribe,
            database: database,
        };
    };