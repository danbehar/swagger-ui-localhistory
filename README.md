# Swagger UI Local History

Reference [the implementation](https://danbehar.github.io/swagger-ui-localhistory/swagger.html) to try it out.
## What
This extends Swagger UI to allow saving responses received by Swagger UI into the browser's local storage to be easily used later.   
This contains an updated layout that modifies StandaloneLayout to display the previous responses at the bottom of the page along with the URL and method as well as the time they were received.  
This contains a [sample reference implementation](./swagger.html) that connects to [Swagger Pet Store](http://petstore.swagger.io/) using this custom layout.  

## Why
If using Swagger UI as a tool to create / get / mutate data in a development environment, it may be useful to see previous responses that were given. An example of this would be if creating resources, this could serve the ability to easily see older resources that were created, such as account resources.  

## Where not to use
This will store all of the response information in local storage. As such, it should not be used if there is any sensitive data.  
This will only store responses received in the local system. It does not do anything server-side across users or for the current user.  
The current implementation prettifies JSON response bodies. It does not do any formatting for XML responses.  

## Notes
This sample does not use modules or bundle any of the code together. The sample swagger.html uses babel in the browser and directly includes the given js files.  

This does not do anything to prevent the local storage from being written to on each state change. As state can change for things besides receiving a response, it is currently writing to local storage more than necessary.  

The code is separated out into two different files. [swagger-store-response.js](./swagger-store-response.js) hooks into when a response is received and will take care of storing the responses. [swagger-store-response-ui.js](./swagger-store-response-ui.js) provides a layout that can be used to display the responses.  

This does not currently limit the number of responses or size of data being persisted.  

## Links
Reference [Using the Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API) for more details on the local storage API.  
Reference [Swagger UI Customization](https://github.com/swagger-api/swagger-ui/tree/master/docs/customization) for more details on Swagger UI and the hooks that can be added.  
Reference [React](https://reactjs.org/) for more details about React.  
Reference [Redux](https://redux.js.org/) for more details about Redux.  
Reference [Immutable.js](https://facebook.github.io/immutable-js/) for more details about Immutable.js.  

## Screenshot
![Screenshot of History](https://danbehar.github.com/swagger-ui-localhistory-screenshot.png)