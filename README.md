# Geo Twitter VELOCE.
See public tweets by geo location, country and region.

With this code you can also create a simple twitter bot that retweet specific tweets that matches with a your search key.
Simple change the q string:

```
// SEARCH PARAMETER OBJECT
let params = {
        q: 'Your search string',
        ...
```

## Tech Stack
[NodeJs](https://nodejs.org/en/)
[Ejs](https://ejs.co/)
[Socket.io](https://socket.io/)
[NPM - Twitter-lite](https://www.npmjs.com/package/twitter-lite)

![demo](public/imgs/tw-gif.gif)

## Configuration
You need to rename the file "env.env" in the root folder to ".env", and populate the fields with your keys:

```
TWITTER_CONSUMER_KEY=your-twitter-key
TWITTER_CONSUMER_SECRET=your-twitter-secret
TWITTER_ACCESS_TOKEN=your-twitter-tokex
TWITTER_ACCESS_TOKEN_SECRET=your-twitter-token-secret
MAPQUEST_KEY = your-mapquest-key
GOOGLE_MAPS_API_KEY = your-google-key

```
Here you can register a new [Twitter APP](https://developer.twitter.com/en/apps), take the secret keys, and put them inside the .env file, under TWITTER_.

Here you cand register a new [Google APP](https://console.cloud.google.com/apis/), create "New Credentials", copy and paste the secret key inside the .env file under GOOGLE_MAPS_API_KEY.

Go here [Mapquest APP](https://developer.mapquest.com/), signup, create a new application, take the key and put it inside the .env file under MAPQUEST_KEY.

## Installation
Download files, you need to have [NodeJs](https://nodejs.org/en/) installed in your environment.
Open a terminal inside the program folder, to install node modules use this command:

```
npm i

```
# Start
To start the application use this command:

```
npm start

```

Open [Chrome](https://www.google.com/intl/en/chrome/) browser, go to [localhost:3000](http://localhost:3000).



## License
[MIT](https://choosealicense.com/licenses/mit/)

##### with ❤️ @lexpaper