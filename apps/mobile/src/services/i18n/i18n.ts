import { I18nManager } from "react-native";
import * as Localization from "expo-localization";
import { I18n } from "i18n-js";

import en, { Translations } from "./en";
import es from "./es";

const i18n = new I18n({
  en,
  es,
});

i18n.translations = { en, es };

const locales = Localization.getLocales(); // This method is guaranteed to return at least one array item.

// The preferred language is the first element in the array, however, we fallback to en-US, especially for tests.
const preferredLanguage:
  | Localization.Locale
  | { languageTag: string; textDirection: "ltr" | "rtl" } = locales[0] || {
  languageTag: "en-US",
  textDirection: "ltr",
};

i18n.defaultLocale = preferredLanguage.languageTag;
i18n.locale = preferredLanguage.languageTag;

// handle RTL languages
export const isRTL = preferredLanguage.textDirection === "rtl";
I18nManager.allowRTL(isRTL);
I18nManager.forceRTL(isRTL);

i18n.onChange(() => {
  console.log("I18n has changed!");
});

/**
 * Builds up valid keypaths for translations.
 */
export type TxKeyPath = RecursiveKeyOf<Translations>;

// via: https://stackoverflow.com/a/65333050
type RecursiveKeyOf<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: RecursiveKeyOfHandleValue<
    TObj[TKey],
    `${TKey}`
  >;
}[keyof TObj & (string | number)];

type RecursiveKeyOfInner<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: RecursiveKeyOfHandleValue<
    TObj[TKey],
    `['${TKey}']` | `.${TKey}`
  >;
}[keyof TObj & (string | number)];

type RecursiveKeyOfHandleValue<
  TValue,
  Text extends string,
> = TValue extends any[]
  ? Text
  : TValue extends object
    ? Text | `${Text}${RecursiveKeyOfInner<TValue>}`
    : Text;

export { i18n };
