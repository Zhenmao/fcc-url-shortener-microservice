# URL Shortener Microservice

1. You can pass a URL as a parameter and you will receive a shortened URL in the JSON response.
2. When you visit that shortened URL, it will redirect you to your original link.

## Example creation usage:
`https://fcc-zhenmao-url-shortener-microservice.glitch.me/new/https://www.google.com`
`https://fcc-zhenmao-url-shortener-microservice.glitch.me/new/http://foo.com:80`

## Example creation output
`{ "original_url":"http://foo.com:80", "short_url":"https://fcc-zhenmao-url-shortener-microservice.glitch.me/8170" }
`
## Usage:
`https://fcc-zhenmao-url-shortener-microservice.glitch.me/2871`

## Will redirect to:
`https://www.google.com/`