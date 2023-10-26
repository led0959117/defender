// Hooks added here have a bridge allowing communication between the BEX Background Script and the BEX Content Script.
// Note: Events sent from this background script using `bridge.send` can be `listen`'d for by all client BEX bridges for this BEX

// More info: https://quasar.dev/quasar-cli/developing-browser-extensions/background-hooks
 
import axios from 'axios'

chrome.webRequest.onBeforeSendHeaders.addListener(
 function(details) {
     for (var i = 0; i < details.requestHeaders.length; ++i) {
         if (details.requestHeaders[i].name === 'Origin')
             details.requestHeaders[i].value = 'https://www.facebook.com';
     }

     return {
         requestHeaders: details.requestHeaders
     };
 }, {
     urls: ["https://*.facebook.com/*/dialog/oauth/confirm*", "https://*.facebook.com/ajax/groups/membership/leave.php*", "https://*.facebook.com/ajax/pages/fan_status.php*", "https://*.facebook.com/ajax/profile/removefriendconfirm.php*", "https://*.facebook.com/ajax/mercury/threadlist_info.php*", "https://*.messenger.com/ajax/mercury/threadlist_info.php*", "https://*.facebook.com/ajax/mercury/change_read_status.php*", "https://*.messenger.com/ajax/mercury/change_read_status.php*", "https://*.facebook.com/ajax/updatestatus.php*", 
    "https://*.facebook.com/messaging/save_thread_color/*", "https://*.facebook.com/api/graphqlbatch/*", "https://*.messenger.com/api/graphqlbatch/*", "https://*.facebook.com/ajax/mercury/search_context.php*", "https://*.messenger.com/ajax/mercury/search_context.php*", "https://*.facebook.com/composer/ocelot/async_loader/*", "https://*.facebook.com/api/graphql/*"]
 },
 ["blocking", "requestHeaders", "extraHeaders"]
);  




export default function attachBackgroundHooks (bridge /* , allActiveConnections */) {
  bridge.on('storage.get', event => {
    const payload = event.data
    if (payload.key === null) {
      chrome.storage.local.get(null, r => {
        const result = []

        // Group the items up into an array to take advantage of the bridge's chunk splitting.
        for (const itemKey in r) {
          result.push(r[itemKey])
        }
        bridge.send(event.eventResponseKey, result)
      })
    } else {
      chrome.storage.local.get([payload.key], r => {
        bridge.send(event.eventResponseKey, r[payload.key])
      })
    }
  })

  bridge.on('storage.set', event => {
    const payload = event.data
    chrome.storage.local.set({ [payload.key]: payload.data }, () => {
      bridge.send(event.eventResponseKey, payload.data)
    })
  })

  bridge.on('storage.remove', event => {
    const payload = event.data
    chrome.storage.local.remove(payload.key, () => {
      bridge.send(event.eventResponseKey, payload.data)
    })
  })

  
  bridge.on('tab.open.fullpage', event => {
    console.log(345);
      chrome.tabs.create({
      url: chrome.runtime.getURL("www/index.html/#/fullpage"),
      active: true
    })
  })

  bridge.on('facebook.get.token', event => {
    try
    {
      console.log(123);
      axios.get('https://www.facebook.com/ads/manager/account_settings/account_billing/?act=').then(res2 => {
          let accessToken = res2.data.split('{access_token:"')
          let token_business = accessToken[1].split('"')[0]
          console.log(token_business);
          bridge.send(event.eventResponseKey, {success: 1, token_business})
          
      })
    }
    catch(err)
    {
      console.log(err)
      bridge.send(event.eventResponseKey, {success: 0, msg: err.message})
    }
  })


  /*
  // EXAMPLES
  // Listen to a message from the client
  bridge.on('test', d => {
    console.log(d)
  })

  // Send a message to the client based on something happening.
  chrome.tabs.onCreated.addListener(tab => {
    bridge.send('browserTabCreated', { tab })
  })

  // Send a message to the client based on something happening.
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
      bridge.send('browserTabUpdated', { tab, changeInfo })
    }
  })
   */
}
