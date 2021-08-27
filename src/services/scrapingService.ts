import playwright from 'playwright'

export const useScrapingService = () => {
  /**
   * https://support.apple.com/ja-jp/HT208040
   * 最も新しい（最上部の） 「Apple Configurator の新機能」 のタイトルを取得します。
   */
  const getFirstNewFunctionH2FromACSite = async () => {
    const browser = await playwright.chromium.launch()
    const page = await browser.newPage()
    await page.goto('https://support.apple.com/ja-jp/HT208040')
    const h2Element = await page.$eval('#sections > div:nth-child(2) > h2', (elm) => {
      return elm.innerHTML
    })

    return h2Element
  }

  /**
   * https://support.apple.com/ja-jp/HT208040
   * 最も新しい（最上部の） 「Apple Configurator の新機能」 のリストを取得します。
   */
  const getFirstNewFunctionDivFromACSite = async () => {
    const browser = await playwright.chromium.launch()
    const page = await browser.newPage()
    await page.goto('https://support.apple.com/ja-jp/HT208040')
    const divElement = await page.$eval('#sections > div:nth-child(2) > div > ul', (elm) => {
      return elm.innerHTML
    })

    return divElement
  }

  return {
    getFirstNewFunctionH2FromACSite,
    getFirstNewFunctionDivFromACSite,
  }
}
