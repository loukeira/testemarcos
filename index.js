const puppeteer = require('puppeteer');

exports.handler = async (req, res) => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://www.flashscore.com.br', { waitUntil: 'networkidle2' });

    // Aceitar cookies
    const [cookieButton] = await page.$x('/html/body/div[6]/div[2]/div/div[1]/div/div[2]/div/button[1]');
    if (cookieButton) {
      await cookieButton.click();
      console.log('Cookies aceitos com sucesso!');
    } else {
      console.error('Botão de cookies não encontrado!');
      await browser.close();
      res.status(500).send('Erro ao aceitar cookies.');
      return;
    }

    // Espera para garantir que a página carregue completamente após aceitar os cookies
    await page.waitForTimeout(3000);

    // Definir a variável para escolher o tipo de captura
    const captureFullPage = false; // Mude para true se quiser capturar a página inteira

    let screenshotBuffer;
    if (captureFullPage) {
      // Capturar a página inteira
      screenshotBuffer = await page.screenshot({ fullPage: true });
      console.log('Screenshot da página inteira capturado.');
    } else {
      // Selecionar o elemento específico para captura usando seletor CSS
      
      const element = await page.$('#live-table > section > div > div:nth-child(1)');
      if (element) {
        // Capturar o screenshot do elemento específico
        screenshotBuffer = await element.screenshot();
        console.log('Screenshot do elemento capturado.');
      } else {
        console.error('Elemento específico não encontrado!');
        await browser.close();
        res.status(500).send('Elemento específico não encontrado.');
        return;
      }
    }

    await browser.close();

    // Enviar a imagem como resposta
    res.set('Content-Type', 'image/png');
    res.send(screenshotBuffer);
  } catch (error) {
    console.error('Erro ao executar o Puppeteer:', error);
    res.status(500).send('Erro ao executar o Puppeteer');
  }
};
