import { chromium } from 'playwright'

async function getData(date) {
    const atcUrl = `https://atcsports.io/results?horario=18%3A30&tipoDeporte=7&dia=${date}&placeId=69y7pkxfg&locationName=CABA%2C+Ciudad+Aut%C3%B3noma+de+Buenos+Aires%2C+Argentina`
    const browser = await chromium.launch({ headless: true });
    console.log(atcUrl)
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto(atcUrl, { waitUntil: 'domcontentloaded' })
    const data = await page.$$eval(
        '[class*="ClubCardContainer"]',
        cards => cards.map((a) => {
            const cancha = a.querySelector('h4 span')?.textContent.trim() || "";
            const horarios = Array.from(
                a.querySelectorAll('[class*="AvailablesContainer"] button')).map(b => b.textContent.trim())
            console.log(horarios)
            return { cancha, horarios };
        })
    );

    const newData = data.filter(d => d.horarios.length > 0);

    await browser.close();
    return newData;
}

async function manageData() {
    let data = await Promise.all(
        getNext7Days().map(async (date) => {
            let dayData = await getData(date);
            if (dayData.length > 0) {
                return { [date]: dayData };
            } else {
                return { [date]: "No times left" }
            }
        })
    )
    return data;
}

function getNext7Days() {
    const result = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        // Formato YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        result.push(`${year}-${month}-${day}`);
    }
    console.log(result)
    return result;
}
export default manageData;