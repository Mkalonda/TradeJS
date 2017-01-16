![Alt text](doc/logo/TradeJS-medium.png?raw=true "Title")

## A full featured stock trading client + server that includes a full IDE and backtest environment. But can be you used with your preferred IDE also! (unlike MetaTrader/cloud9 etc) 

Can be run as
- Desktop client (electron)
- (public)Website
- Standalone client connected to the cloud (with a custom server)
- Standalone server running elastic in the cloud (with a custom client)

 #(!!Under heavy development!! (27 nov 2016))
 probably best to come back in another 2 months ;)
 

 ## Dashboard
 ![Alt text](doc/screenshot/dashboard.png?raw=true "Title")
 
 ## Backtest
 ![Alt text](doc/screenshot/backtest.png?raw=true "Title")
 
 ## Build in Editor
 ![Alt text](doc/screenshot/editor.png?raw=true "Title")
 
  #### How to start (temp, this will be normalized in the future)
  
  ```
 
     npm install --save tradejs
     
     # terminal 1
     cd node_modules/tradejs
     npm run client:dev
     
     # terminal 2
     cd node_modules/tradejs
     npm run server:dev
     
     ### For native desktop app (electron), replace terminal 2 with ->
     # terminal 2
     cd node_modules/tradejs
     npm run electron:dev
    
 ```
 
 Make sure you have a **practise** account on Oanda (https://www.oanda.com/).
 
 * Optional - Not needed when using electron. Go to http://localhost:4200 in Chrome
 * Click on login and fill in Oanda credentials
 * Probably a few refreshes/reboots is still required (will be smoothed out in the future)
 