import { Builder, Browser, By, until } from "selenium-webdriver";
import {expect} from "chai";
import { promises as fs } from "fs";
import mocha from "mocha";
const { it, describe, after } = mocha;

const BrowserType = Browser.CHROME;
const URL = "https://www.amazon.com/";
const SLEEP_TIME1 = 1000;
const SLEEP_TIME3 = 3000;

let driver = new Builder().forBrowser(BrowserType).build();

class MainPage {
  constructor(driver) {
    this.driver = driver;
    this.locator = {
      searchInput: By.id("twotabsearchtextbox"),
      searchButton: By.id("nav-search-submit-button"),
    };
  }

  async openURL() {
    await driver.get(URL);
    await driver.manage().window().maximize();
    await driver.sleep(6000);
    console.log("Перейти по ссылке");
    await driver.sleep(SLEEP_TIME1);
  }

  async searchProduct(productName) {
    await this.driver
      .findElement(this.locator.searchInput)
      .sendKeys(productName);
    await this.driver.findElement(this.locator.searchButton).click();
    console.log(`Поиск продукта: ${productName}`);
    await this.driver.sleep(SLEEP_TIME3);
  }
}

class SearchResultsPage {
  constructor(driver) {
    this.driver = driver;
    this.locator = {
      productTitles: By.css(".s-main-slot .s-result-item h2 a"),
      memory: By.xpath("//span[text()='256 GB']"),
    };
    this.variables = {
      firstProductName: "",
    };
  }

  async getFirstProductName() {
    await this.driver.wait(
      until.elementsLocated(this.locator.productTitles),
      SLEEP_TIME3
    );
    let productTitles = await this.driver.findElements(
      this.locator.productTitles
    );
    this.variables.firstProductName = await productTitles[0].getText();
    console.log(
      `Название первого продукта: ${this.variables.firstProductName}`
    );
  }

  async verifyProductMemoryInResults() {
    let productTitles = await this.driver.findElements(
      this.locator.productTitles
    );
    let productFound = false;
    for (let titleElement of productTitles) {
      let title = await titleElement.getText();
      if (title.includes("256GB")) {
        productFound = true;
        break;
      }
    }
    expect(productFound).to.be.true;
    console.log(`Продукт с 256GB успешно найден в результатах поиска.`);
  }

  async verifyProductInResults(productName) {
    let productTitles = await this.driver.findElements(
      this.locator.productTitles
    );
    let productFound = false;
    for (let titleElement of productTitles) {
      let title = await titleElement.getText();
      if (title.includes(productName)) {
        productFound = true;
        break;
      }
    }
    expect(productFound).to.be.true;
    console.log(
      `Продукт с названием "${productName}" успешно найден в результатах поиска.`
    );
  }

  async filterByMemory() {
    await this.driver.wait(
      until.elementLocated(this.locator.memory),
      SLEEP_TIME3
    );
    await this.driver.findElement(this.locator.memory).click();
    console.log(`Фильтр по памяти 512GB`);
    await this.driver.sleep(SLEEP_TIME3);
  }
}

describe("Amazon Product Search with Memory Filter", function () {
  this.timeout(100000);

  it("Поиск продукта на Amazon", async function () {
    try {
      let mainPage = new MainPage(driver);
      await mainPage.openURL();
      await mainPage.searchProduct("Apple iPhone 13");
    } catch (err) {
      await driver.takeScreenshot().then(async function (image) {
        await fs.writeFile("screenshot_error.png", image, "base64");
      });
      console.error("Ошибка на главной странице: %s", err);
      throw err;
    }
  });

  it("Проверка наличия продукта в результатах поиска", async function () {
    try {
      let searchResultsPage = new SearchResultsPage(driver);
      await searchResultsPage.getFirstProductName();
      await searchResultsPage.verifyProductInResults("Apple iPhone 13");
    } catch (err) {
      await driver.takeScreenshot().then(async function (image) {
        await fs.writeFile("screenshot_error.png", image, "base64");
      });
      console.error("Ошибка на странице результатов поиска: %s", err);
      throw err;
    }
  });

  it("Фильтрация результатов по памяти", async function () {
    try {
      let searchResultsPage = new SearchResultsPage(driver);
      await searchResultsPage.filterByMemory();
      await searchResultsPage.getFirstProductName();
      await searchResultsPage.verifyProductMemoryInResults();
    } catch (err) {
      await driver.takeScreenshot().then(async function (image) {
        await fs.writeFile("screenshot_error.png", image, "base64");
      });
      console.error("Ошибка при фильтрации по памяти: %s", err);
      throw err;
    }
  });

  after(async function () {
    await driver.quit();
  });
});
