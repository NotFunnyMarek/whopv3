// src/utils/cookieUtils.js

// Uloží do cookie (na 1 den) objekt whopSetup
export function setWhopSetupCookie(dataObj) {
  const value = encodeURIComponent(JSON.stringify(dataObj));
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `whopSetup=${value}; path=/; expires=${expires}`;
}

// Načte z cookie objekt whopSetup (nebo null)
export function getWhopSetupCookie() {
  const match = document.cookie.match(/(?:^|;\s*)whopSetup=([^;]+)/);
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

// Smaže cookie whopSetup
export function clearWhopSetupCookie() {
  document.cookie = `whopSetup=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
