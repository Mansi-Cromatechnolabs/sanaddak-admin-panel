'use client';

import merge from 'lodash/merge';
import { enUS as enUSAdapter, arSA as arSAAdapter } from 'date-fns/locale';
import { enUS as enUSDate } from '@mui/x-date-pickers/locales';
import { enUS as enUSCore, arSA as arSACore } from '@mui/material/locale';
import { enUS as enUSDataGrid, arSD as arSDDataGrid } from '@mui/x-data-grid';

export const allLangs = [
  {
    label: 'English',
    value: 'en',
    systemValue: merge(enUSDate, enUSDataGrid, enUSCore),
    adapterLocale: enUSAdapter,
    icon: 'flagpack:gb-nir',
    numberFormat: {
      code: 'en-US',
      currency: 'USD',
    },
  },
  // {
  //   label: 'French',
  //   value: 'fr',
  //   systemValue: merge(frFRDate, frFRDataGrid, frFRCore),
  //   adapterLocale: frFRAdapter,
  //   icon: 'flagpack:fr',
  //   numberFormat: {
  //     code: 'fr-Fr',
  //     currency: 'EUR',
  //   },
  // },
  // {
  //   label: 'Vietnamese',
  //   value: 'vi',
  //   systemValue: merge(viVNDate, viVNDataGrid, viVNCore),
  //   adapterLocale: viVNAdapter,
  //   icon: 'flagpack:vn',
  //   numberFormat: {
  //     code: 'vi-VN',
  //     currency: 'VND',
  //   },
  // },
  // {
  //   label: 'Chinese',
  //   value: 'cn',
  //   systemValue: merge(zhCNDate, zhCNDataGrid, zhCNCore),
  //   adapterLocale: zhCNAdapter,
  //   icon: 'flagpack:cn',
  //   numberFormat: {
  //     code: 'zh-CN',
  //     currency: 'CNY',
  //   },
  // },
  {
    label: 'Arabic',
    value: 'ar',
    systemValue: merge(arSDDataGrid, arSACore),
    adapterLocale: arSAAdapter,
    icon: 'flagpack:sa',
    numberFormat: {
      code: 'ar',
      currency: 'AED',
    },
  },
];

export const defaultLang = allLangs[0];