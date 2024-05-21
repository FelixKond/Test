const { Builder, Browser, By } = require('selenium-webdriver');

const assert = require('assert');
const BrowserType = Browser.CHROME;
const URL = 'https://market.yandex.ru/';
const SLEEP_TIME1 = 1000;
const SLEEP_TIME3 = 3000;
const SLEEP_TIME5 = 5000;
const SLEEP_TIME7 = 7000;

let driver = new Builder().forBrowser(BrowserType).build();

class MainPage {
    constructor(driver) {
        this.driver = driver;
        this.locator = {
            hamburger: By.xpath("//div[@data-zone-name='catalog']"),
            laptopsAndComputers: By.xpath("//span[contains(text(), 'Ноутбуки и компьютеры')]"),
            tablets_url: By.xpath("//a[@href='/catalog--planshety/54545/list?hid=6427100']")
        }
    }

    async openURL() {
        await driver.get(URL);
        await driver.manage().window().maximize();
        console.log('Перейти по ссылке');
        await driver.sleep(SLEEP_TIME1);
    }

    async getLaptopsAndСomputers() {
        await this.driver.findElement(this.locator.hamburger).click();
        await this.driver.sleep(SLEEP_TIME5);
        let laptopsAndСomputers = await this.driver.findElement(this.locator.laptopsAndComputers);
        await this.driver.sleep(SLEEP_TIME1);
        let element = laptopsAndСomputers;
        let action = this.driver.actions({ async: true });
        await action.move({ origin: element }).perform();
        await this.driver.sleep(SLEEP_TIME1);
        let tablets_url = await this.driver.findElement(this.locator.tablets_url);
        await tablets_url.click();
        console.log('Открыта страница с планшетами');
        await this.driver.sleep(SLEEP_TIME3);
    }
}

class TabletsPage {
    constructor(driver) {
        this.driver = driver;
        this.variables = {
            nameTablets: [],
            priceTablets: [],
            secondDevice: [],
            secondPrice: [],
        }
        this.locator = {
            getSamsung: By.xpath("//span[contains(text(), 'Samsung')]"),
            getBilliger: By.xpath("//button[contains(text(), 'подешевле')]"),
            getFiveNameTablets: By.xpath("//div[@data-auto-themename='listDetailed']//h3[@data-auto='snippet-title']"),
            getFivePriceTablets: By.xpath("//div[@data-auto-themename='listDetailed']//span[@data-auto='snippet-price-current']"),
            getInput: By.xpath("//div[@data-zone-name='search-input']//input[@id='header-search']"),
            getButton: By.xpath("//button[@data-auto='search-button']"),
        }
    }

    async searchSamsung() {
        await this.driver.findElement(this.locator.getSamsung).click();
        console.log('Выбран производитель "Samsung"');
        await this.driver.sleep(SLEEP_TIME7);
    }

    async setThePrice() {
        await this.driver.findElement(this.locator.getBilliger).click();
        console.log('Сортировка списка по цене');
        await this.driver.sleep(SLEEP_TIME1);
    }

    async sortierungList() {
        await this.driver.sleep(SLEEP_TIME5);
        let fiveNameTablets = await this.driver.findElements(this.locator.getFiveNameTablets);
        let fivePriceTablets = await this.driver.findElements(this.locator.getFivePriceTablets);
        await this.driver.sleep(SLEEP_TIME3);
        console.log('Список планшетов:');
        for (let i = 0; i < 5; i++) {
            this.variables.nameTablets[i] = await fiveNameTablets[i].getText();
            this.variables.priceTablets[i] = await fivePriceTablets[i].getText();
            console.log('Название: ' + this.variables.nameTablets[i]);
            console.log('Цена: ' + this.variables.priceTablets[i] + ' рублей');
        }
        console.log('Вывод информации о планшетах');
        await this.driver.sleep(SLEEP_TIME3);
    }

    async rememberDevice() {
        this.variables.secondDevice = this.variables.nameTablets[1];
        this.variables.secondPrice = this.variables.priceTablets[1];
        console.log('Название ' + this.variables.secondDevice);
        console.log('Цена ' + this.variables.secondPrice);
        console.log('Информация о втором устройстве:');
    }

    async deviceSearch() {
        await this.driver.findElement(this.locator.getInput).sendKeys(this.variables.secondDevice);
        await this.driver.sleep(SLEEP_TIME1);
        await this.driver.findElement(this.locator.getButton).click();
        await this.driver.sleep(SLEEP_TIME7);
        console.log('Поиск устройства');
    }
}

describe('Вариант №1', function () {
    this.timeout(100000);
    it('Переход на страницу с товаром', async function () {
        try {
            let mainPage = new MainPage(driver);
            await mainPage.openURL();
            await mainPage.getLaptopsAndСomputers();
        } catch (err) {
            driver.takeScreenshot().then(function (image) {
                require('fs').writeFileSync('screenshot_error.png', image, 'base64');
            });
            console.error('Не работает: %s', err);
        }
    });
    it('Поиск товара по производителю', async function () {
        try {
            let tabletsPage = new TabletsPage(driver);
            await tabletsPage.searchSamsung();
            await tabletsPage.setThePrice();
            await tabletsPage.sortierungList();
            await tabletsPage.rememberDevice();
            await tabletsPage.deviceSearch();

            let allDevices = await driver.findElements(tabletsPage.locator.getFiveNameTablets);
            let thisFirstDevice = allDevices[0];
            let thisFirstDeviceText = await thisFirstDevice.getText();
            assert.strictEqual(thisFirstDeviceText, tabletsPage.variables.secondDevice, 'Названия не совпадают');
        } catch (err) {
            driver.takeScreenshot().then(function (image) {
                require('fs').writeFileSync('screenshot_error.png', image, 'base64');
            });
            console.error('Не работает: %s', err);
        }
    })
    after(async function () {
        await driver.quit();
    });
})