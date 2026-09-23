import type { Locale } from "@/lib/i18n/config";
import type { FileRejection } from "./files";

/**
 * Why a file was turned away, in the reader's language.
 *
 * Shared by the picker, which says it as you choose, and the form, which
 * says it if the server disagrees. One copy so the two can never phrase the
 * same refusal differently.
 */
export const FILE_ERRORS: Record<Locale, Record<FileRejection, string>> = {
  fr: {
    too_many_files: `Huit fichiers au maximum.`,
    file_too_large: "Ce fichier dépasse 10 Mo.",
    total_too_large: "L’ensemble des fichiers dépasse 30 Mo.",
    unsupported_type: "Formats acceptés : PDF, JPG, PNG.",
  },
  en: {
    too_many_files: "Eight files at most.",
    file_too_large: "That file is over 10 MB.",
    total_too_large: "The files come to more than 30 MB in total.",
    unsupported_type: "Accepted formats: PDF, JPG, PNG.",
  },
  zh: {
    too_many_files: "最多 8 个文件。",
    file_too_large: "该文件超过 10 MB。",
    total_too_large: "文件总大小超过 30 MB。",
    unsupported_type: "支持的格式：PDF、JPG、PNG。",
  },
  ar: {
    too_many_files: "ثمانية ملفات كحد أقصى.",
    file_too_large: "هذا الملف يتجاوز 10 ميغابايت.",
    total_too_large: "مجموع الملفات يتجاوز 30 ميغابايت.",
    unsupported_type: "الصيغ المقبولة: PDF وJPG وPNG.",
  },
  es: {
    too_many_files: "Ocho archivos como máximo.",
    file_too_large: "Ese archivo supera los 10 MB.",
    total_too_large: "Los archivos suman más de 30 MB.",
    unsupported_type: "Formatos aceptados: PDF, JPG, PNG.",
  },
  de: {
    too_many_files: "Höchstens acht Dateien.",
    file_too_large: "Diese Datei ist größer als 10 MB.",
    total_too_large: "Die Dateien ergeben zusammen mehr als 30 MB.",
    unsupported_type: "Zulässige Formate: PDF, JPG, PNG.",
  },
  it: {
    too_many_files: "Massimo otto file.",
    file_too_large: "Questo file supera i 10 MB.",
    total_too_large: "I file superano i 30 MB in totale.",
    unsupported_type: "Formati accettati: PDF, JPG, PNG.",
  },
  pt: {
    too_many_files: "No máximo oito ficheiros.",
    file_too_large: "Esse ficheiro ultrapassa 10 MB.",
    total_too_large: "Os ficheiros somam mais de 30 MB.",
    unsupported_type: "Formatos aceites: PDF, JPG, PNG.",
  },
  nl: {
    too_many_files: "Maximaal acht bestanden.",
    file_too_large: "Dat bestand is groter dan 10 MB.",
    total_too_large: "De bestanden zijn samen meer dan 30 MB.",
    unsupported_type: "Toegestane formaten: PDF, JPG, PNG.",
  },
  ru: {
    too_many_files: "Не более восьми файлов.",
    file_too_large: "Этот файл больше 10 МБ.",
    total_too_large: "Суммарный размер файлов больше 30 МБ.",
    unsupported_type: "Допустимые форматы: PDF, JPG, PNG.",
  },
  tr: {
    too_many_files: "En fazla sekiz dosya.",
    file_too_large: "Bu dosya 10 MB’ı aşıyor.",
    total_too_large: "Dosyalar toplamda 30 MB’ı aşıyor.",
    unsupported_type: "Kabul edilen biçimler: PDF, JPG, PNG.",
  },
  pl: {
    too_many_files: "Maksymalnie osiem plików.",
    file_too_large: "Ten plik przekracza 10 MB.",
    total_too_large: "Pliki łącznie przekraczają 30 MB.",
    unsupported_type: "Akceptowane formaty: PDF, JPG, PNG.",
  },
};
