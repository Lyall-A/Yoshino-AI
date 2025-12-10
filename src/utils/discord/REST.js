class REST {
    constructor(options = { }) {
        this.baseUrl = options.baseUrl ?? 'https://discord.com/api/v10',
        this.token = options.token;
        this.authorization = options.authorization;
    }

    async get(path) {
        return this.request(path, {
            method: 'GET'
        });
    }

    async post(path, options = { }) {
        const headers = { };

        let body;
        if (options.files) {
            body = new FormData();
            body.set('payload_json', JSON.stringify(options.body));
            options.files.forEach((file, fileIndex) => {
                body.set(`files[${fileIndex}]`, new Blob([file.data], { type: file.type }), file.name);
            });
        } else {
            body = JSON.stringify(options.body);
            headers['Content-Type'] = 'application/json';
        }

        return this.request(path, {
            method: 'POST',
            headers,
            body
        });
    }

    async request(path, options = { }) {
        return fetch(`${this.baseUrl}${path}`, {
            ...options,
            method: options.method ?? 'GET',
            headers: {
                Authorization: this.authorization ?? `Bot ${this.token}`, // heh
                ...options.headers || { }
            },
        }).then(async res => {
            const buffer = Buffer.from(await res.arrayBuffer());
            const text = buffer.toString();
            let json;
            try { json = JSON.parse(text) } catch (err) {  };
            
            return {
                status: res.status,
                statusText: res.statusText,
                headers: res.headers,
                buffer,
                text,
                json
            };
        });
    }
}

module.exports = REST;