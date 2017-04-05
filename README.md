![Alt text](doc/logo/TradeJS-medium.png?raw=true "Title")

## A full featured stock trading client + server that includes a full IDE and backtest environment. But can be you used with your preferred IDE also! (unlike MetaTrader/cloud9 etc) 

Can be run as
- Desktop client (electron)
- (public)Website
- Standalone client connected to the cloud (with a custom server)
- Standalone server running elastic in the cloud (with a custom client)

 #Under heavy development! (12 02  2017))
 Probably best to come back in another 2 months ;)
 

 ![Alt text](doc/screenshot/dashboard.png?raw=true "Title")
 
 ## Build in Editor
 ![Alt text](doc/screenshot/editor.png?raw=true "Title")
 
 ## Mobile (in development)
 ![Alt text](doc/screenshot/mobile.png?raw=true "Title")
 
  #### How to start (temp, this will be normalized in the future)
  
  Make sure you have a **practise** account on Oanda (https://www.oanda.com/).
  
  ```
     
     # terminal 1
     cd [PATH_TO_TRADEJS]/client
     npm i
     npm start
     
     # terminal 2
     cd [PATH_TO_TRADEJS]/server
     npm i
     npm start
     
     ### For native desktop app (electron), replace terminal 2 with ->
     # terminal 2
     cd node_modules/tradejs
     npm run electron:dev
    
 ```
 
 * Optional - Not needed when using electron. Go to http://localhost:4200 in Chrome
 * Click on login and fill in Oanda credentials
 * Probably a few refreshes/reboots is still required (will be smoothed out in the future)
 