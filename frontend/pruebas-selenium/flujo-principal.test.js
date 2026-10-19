/**
 * @file flujo-principal.test.js
 * @description Pruebas de sistema con Selenium WebDriver (Chrome sin ventana) sobre la
 *              aplicación desplegada: inicio de sesión, registro, búsqueda, permisos por rol y
 *              cierre de sesión. Se ejecutan con el corredor de pruebas de Node (node --test).
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-18
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.0.0
 */
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

const URL = process.env.E2E_URL || 'http://localhost:8081';
const ESPERA = 15000;
let driver;

const porTestId = (id) => By.css(`[data-testid="${id}"]`);
const esperar = (localizador) => driver.wait(until.elementLocated(localizador), ESPERA);
const visible = async (localizador) => driver.wait(until.elementIsVisible(await esperar(localizador)), ESPERA);

async function entrar(usuario, clave) {
  await driver.get(`${URL}/login`);
  await (await visible(By.id('username'))).sendKeys(usuario);
  await driver.findElement(By.id('password')).sendKeys(clave);
  await driver.findElement(porTestId('boton-entrar')).click();
  await visible(porTestId('boton-nuevo'));
}

async function salir() {
  await (await visible(porTestId('boton-salir'))).click();
  await driver.wait(until.urlContains('/login'), ESPERA);
}

describe('Selenium · flujo principal', () => {
  before(async () => {
    const opciones = new chrome.Options().addArguments('--headless=new', '--window-size=1280,900', '--lang=es-CO');
    driver = await new Builder().forBrowser('chrome').setChromeOptions(opciones).build();
  });

  after(async () => {
    await driver?.quit();
  });

  it('CA-01.2 credenciales incorrectas muestran el error', async () => {
    await driver.get(`${URL}/login`);
    await (await visible(By.id('username'))).sendKeys('admin');
    await driver.findElement(By.id('password')).sendKeys('incorrecta');
    await driver.findElement(porTestId('boton-entrar')).click();
    const error = await visible(porTestId('error-login'));
    assert.equal(await error.getText(), 'Usuario o contraseña incorrectos');
  });

  it('CA-01.1 / CA-02.1 / CA-03.2 el operario inicia sesión, registra un producto y lo encuentra', async () => {
    await entrar('operario', process.env.E2E_USUARIO_PASSWORD || 'Operario123*');
    const nombre = `Selenium ${Date.now().toString(36)}`;

    await driver.findElement(porTestId('boton-nuevo')).click();
    await (await visible(By.id('nombre'))).sendKeys(nombre);
    await driver.findElement(porTestId('select-categoria')).click();
    await (await visible(By.xpath("//li[@role='option' and normalize-space()='Jasmine']"))).click();
    await driver.findElement(By.id('descripcion')).sendKeys('Registrado con Selenium WebDriver');
    await driver.findElement(porTestId('boton-guardar')).click();

    await visible(porTestId('boton-nuevo'));
    await driver.findElement(porTestId('filtro-q')).sendKeys(nombre);
    // El listado se vuelve a dibujar al filtrar: si una fila desaparece a mitad de la lectura, se reintenta.
    const textoFila = await driver.wait(async () => {
      try {
        for (const f of await driver.findElements(porTestId('producto'))) {
          const texto = await f.getText();
          if (texto.includes(nombre)) return texto;
        }
      } catch (e) {
        if (e.name !== 'StaleElementReferenceError') throw e;
      }
      return null;
    }, ESPERA);
    assert.match(textoFila, /Jasmine/);
  });

  it('CA-01.4 el operario no tiene botones de eliminar', async () => {
    const botones = await driver.findElements(By.css('[data-testid^="eliminar-"]'));
    assert.equal(botones.length, 0);
    await salir();
  });

  it('CA-05.3 el administrador ve eliminar y el diálogo pide confirmación', async () => {
    await entrar('admin', process.env.E2E_ADMIN_PASSWORD || 'Admin123*');
    await (await visible(By.css('[data-testid^="eliminar-"]'))).click();
    const dialogo = await visible(By.css('[role="dialog"]'));
    assert.match(await dialogo.getText(), /¿Eliminar producto\?/);
    await dialogo.findElement(By.xpath(".//button[normalize-space()='Cancelar']")).click();
    await driver.wait(until.stalenessOf(dialogo), ESPERA);
    await salir();
  });

  it('CA-01.3 después de cerrar sesión la página protegida redirige al inicio', async () => {
    await driver.get(`${URL}/productos`);
    await driver.wait(until.urlContains('/login'), ESPERA);
    assert.ok((await driver.getCurrentUrl()).endsWith('/login'));
  });
});
