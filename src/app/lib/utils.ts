import puppeteer from "puppeteer";
import { neon } from "@neondatabase/serverless";
process.loadEnvFile();
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}
import { Newsletter } from "./definitions";
const sql = neon(process.env.DATABASE_URL);

export async function scrapeHuelva() {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ["--start-maximized"],
    });
    const page = await browser.newPage();
    await page.goto(
      "https://s2.diphuelva.es/servicios/bope_web/busquedaCalendario",
      { waitUntil: "networkidle2" }
    );

    const data = await sql`SELECT date FROM newsletters ORDER BY date desc;`;
    const lastRevisedDate = new Date(data[0].date);

    
    const news: { [key: string]: Newsletter[] } = {};
    let today = await page.evaluate(() => {
      const currentDay = document.querySelector(".DynarchCalendar-day-today");
      return currentDay ? currentDay.getAttribute("dyc-date") : null;
    });

    if (today) {
      today = today.slice(0, 4) + "/" + today.slice(4);
      today = today.slice(0, 7) + "/" + today.slice(7);
    } else {
      throw new Error("Unable to determine today's date.");
    }
    const currentDay = new Date(today);

    while (currentDay > lastRevisedDate) {
      if (currentDay.getDay() === 1 || currentDay.getDay() === 0) {
        currentDay.setDate(currentDay.getDate() - 1);
        continue;
      }

      const allnews = await page.evaluate(() => {
        const newsletters = Array.from(
          document.querySelectorAll(".cssAnuncios")
        );
        return newsletters.map((newsletter) => {
          const titleRegex = /<b>(.*?)<\/b>/;
          const dateRegex = /<i>(.*?)<\/i>/;
          const descriptionRegex = /<br>(.*)/;

          const content =
            newsletter.querySelector(".Elemento_titulo")?.innerHTML;
          const titleMatch = content ? content.match(titleRegex) : null;
          const dateMatch = content ? content.match(dateRegex) : null;
          const descriptionMatch = content ? content.match(descriptionRegex) : null;

          const title = titleMatch ? titleMatch[1] : null;
          const date = dateMatch ? dateMatch[1] : null;
          const description = descriptionMatch ? descriptionMatch[1] : null;

          // Get the id of the advertisement and link
          const onClickElement = newsletter.querySelector(".anuncio_izq");
          const onClickAttr = onClickElement ? onClickElement.getAttribute("onclick") : null;
          const idMatch = onClickAttr ? onClickAttr.match(/anuncio=(\d+)/) : null;
          const id = idMatch ? idMatch[1] : null;
          const advertiseLink =
            "https://s2.diphuelva.es/servicios/bope_web/anuncio/?anuncio=" + id;

          // Get the PDF link
          const onClickPDFElement = newsletter
            .querySelector(
              ".anuncio_der input[title='Descargar PDF'][type='image']"
            );
          const onClickPDFAttr = onClickPDFElement ? onClickPDFElement.getAttribute("onclick") : null;
          const pdfMatch = onClickPDFAttr ? onClickPDFAttr.match(/'([^']+)'/) : null;
          const pdf = pdfMatch ? pdfMatch[1] : null;
          const pdfLink =
            "https://s2.diphuelva.es/portalweb/bope/anuncios/" + pdf;

          return { title, date, description, id, advertiseLink, pdfLink };
        });
      });

      currentDay.setDate(currentDay.getDate() + 1); // Sumar un día
      const dateString = currentDay.toISOString().split("T")[0];
      currentDay.setDate(currentDay.getDate() - 1); // Restablecer el día

      if (allnews.length > 0) {
        news[dateString] = allnews;
      }

      const cambioMes = currentDay.getDate() === 1;
      const currentStringDay = currentDay
        .toISOString()
        .split("T")[0]
        .replace(/-/g, "");
      currentDay.setDate(currentDay.getDate() - 1);

      if (cambioMes) {
        await page.click(".DynarchCalendar-prevMonth");
      }
      await page.click(`[dyc-date="${currentStringDay}"]`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    const response =
      await sql`INSERT INTO newsletters (title, date, description, link, summary) VALUES ${Object.entries(
        news
      )
        .map(([date, newsletters]) =>
          newsletters.map((newsletter) => [
            newsletter.title,
            date,
            newsletter.description,
            newsletter.advertiseLink,
            newsletter.pdfLink,
          ])
        )
        .flat()}`;
    console.log(response);
    await browser.close();
}