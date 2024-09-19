'use client';

/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable perfectionist/sort-imports */
import 'src/global.css';
import 'react-toastify/dist/ReactToastify.css';

// i18n
import 'src/locales/i18n';

// ----------------------------------------------------------------------
import PropTypes from 'prop-types';

import { LocalizationProvider } from 'src/locales';

import ThemeProvider from 'src/theme';
import { primaryFont } from 'src/theme/typography';

import { MotionLazy } from 'src/components/animate/motion-lazy';
import SnackbarProvider from 'src/components/snackbar/snackbar-provider';
import { SettingsDrawer, SettingsProvider } from 'src/components/settings';
import ProgressBar from 'src/components/progress-bar/progress-bar';

import { AuthProvider } from 'src/auth/context/jwt';

import 'bootstrap/dist/css/bootstrap.css';
import 'leaflet/dist/leaflet.css';

import { StoreProvider } from 'src/redux/StoreProvider';
import { ToastContainer } from 'react-toastify';
import { Suspense } from 'react';
import Loading from './loading';
import { metadata } from './metadata';
// import { AuthProvider } from 'src/auth/context/auth0';
// import { AuthProvider } from 'src/auth/context/amplify';
// import { AuthProvider } from 'src/auth/context/firebase';
// import { AuthProvider } from 'src/auth/context/supabase';

// ----------------------------------------------------------------------

export const viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={primaryFont.className}>
      <head>
        <link rel="icon" href="/favicon/favicon.ico" />
        <title>{metadata.title}</title>
      </head>
      <body suppressHydrationWarning>
        <Suspense fallback={<Loading />}>
          <StoreProvider>
            <AuthProvider>
              <LocalizationProvider>
                <SettingsProvider
                  defaultSettings={{
                    themeMode: 'light', // 'light' | 'dark'
                    themeDirection: 'ltr', //  'rtl' | 'ltr'
                    themeContrast: 'default', // 'default' | 'bold'
                    themeLayout: 'vertical', // 'vertical' | 'horizontal' | 'mini'
                    themeColorPresets: 'default', // 'default' | 'cyan' | 'purple' | 'blue' | 'orange' | 'red'
                    themeStretch: false,
                  }}
                >
                  <ThemeProvider>
                    <MotionLazy>
                      <SnackbarProvider>
                        <SettingsDrawer />
                        <ProgressBar />
                        {children}
                      </SnackbarProvider>
                    </MotionLazy>
                  </ThemeProvider>
                </SettingsProvider>
              </LocalizationProvider>
              <ToastContainer />
            </AuthProvider>
          </StoreProvider>
        </Suspense>
      </body>
    </html>
  );
}

RootLayout.propTypes = {
  children: PropTypes.node,
};
