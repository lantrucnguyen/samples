import 'babel-polyfill'
import 'colors'
import wd from 'wd'
import {assert} from 'chai'

const username = process.env.KOBITON_USERNAME
const apiKey = process.env.KOBITON_API_KEY
const deviceName = process.env.KOBITON_DEVICE_NAME || 'Galaxy*'

const kobitonServerConfig = {
  protocol: 'https',
  host: 'api.kobiton.com',
  auth: `${username}:${apiKey}`
}

const desiredCaps = {
  sessionName:        'Automation test session',
  sessionDescription: 'This is an example for Android app',
  deviceOrientation:  'portrait',
  captureScreenshots: true,
  deviceGroup:        'KOBITON',
  deviceName:         deviceName,
  platformName:       'Android',
  app: 'https://kobiton-devvn.s3-ap-southeast-1.amazonaws.com/apps-test/hybrid-app-debug.apk',
  appPackage: 'com.kobiton.hybrid_sample',
  appActivity: 'com.kobiton.hybrid_sample.MainActivity'
}

let driver

if (!username || !apiKey) {
  console.log('Error: Environment variables KOBITON_USERNAME and KOBITON_API_KEY are required to execute script')
  process.exit(1)
}

describe('Android App sample', () => {

  before(async () => {
    driver = wd.promiseChainRemote(kobitonServerConfig)

    driver.on('status', (info) => {
      console.log(info.cyan)
    })
    driver.on('command', (meth, path, data) => {
      console.log(' > ' + meth.yellow, path.grey, data || '')
    })
    driver.on('http', (meth, path, data) => {
      console.log(' > ' + meth.magenta, path, (data || '').grey)
    })

    try {
      await driver.init(desiredCaps)
    }
    catch (err) {
      if (err.data) {
        console.error(`init driver: ${err.data}`)
      }
    throw err
    }
  })

  it('should click GO', async () => {
    await driver
    .contexts()
    .elementByClassName("android.widget.Button")
    .click()
    .source()
    .sleep(1000)  
  })

  it('should switch to WebView', async ()=> {
    await driver
      .elementByClassName("android.webkit.WebView")
      .contexts().then(function (contexts) { // get list of available views. Returns array: ["NATIVE_APP","WEBVIEW_1"]
      return driver.context(contexts[1]) // choose the webview context
      .element("id", "fname")
      .click()
      .sleep(1000)
      .sendKeys("Truc")
      .element("id", "lname")
      .click()
      .sleep(1000)
      .sendKeys("Ne!")  
    })
  })

  it('should Submit', async ()=> {
    await driver
    .element("id", "submit")
    .click()
    .sleep(1000)
    .source()
  })
  
  after(async () => {
    if (driver != null) {
      try {
        await driver.quit()
      }
      catch (err) {
        console.error(`quit driver: ${err}`)
      }
    }
  })
})
