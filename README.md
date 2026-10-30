# Byteful Fullstack Assessment

#### By Felix Underwood

## Running the App

Build and start the application using npm:

```
npm run build
npm start
```

The app makes use of two environment variables `PUBLIC_KEY` and `PRIVATE_KEY` which are stored locally in .env.local. An example of the .env.local file can be found in .env.example.

## Additional Features

The first change I would make if I had more time to work on the application would be to implement a cache for the lists of countries, cities and especially ASNs returned by the API. This would avoid repeated API calls and thus reduce load on the server.

Another area I would change is by replacing the timer for key event checks in the ASN search, and adding debouncing for all three input fields. This would avoid repeated API calls when the user is quickly typing in the field, reducing calls to the API without affecting the user experience.

Finally, I think a next step would be to create some form of user credential verification to ensure that the user is actually authenticated to use the system. This wouldn't have to be terribly complex, requiring a new API route for the check.

## Trade-Offs

Much of the trade-offs that I had to make with the system came down to implementing more of the functionality instead of optimising individual systems. This wasn't much of a problem in such a small case, where even 1000 proxies could be generating in under a second and the ASN lists were much the same. However, in a production environment obviously performance plays a much larger role. This is why many of the first changes I would make to the system involve improving response times in some way or another.
