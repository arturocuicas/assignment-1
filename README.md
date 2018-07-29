# assignment-1

## Start Servers

`
NODE_ENV=staging node index.js
NODE_ENV=production node index.js
`

## Https command
`
openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
`
