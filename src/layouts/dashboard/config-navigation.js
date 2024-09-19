import { useMemo } from 'react';

import PaymentIcon from '@mui/icons-material/Payment';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import PortraitIcon from '@mui/icons-material/Portrait';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalculateIcon from '@mui/icons-material/Calculate';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import InsertInvitationIcon from '@mui/icons-material/InsertInvitation';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

import { paths } from 'src/routes/paths';

import { hasPermission } from 'src/utils/permissionUtils';

import { useTranslate } from 'src/locales';

import SvgColor from 'src/components/svg-color';

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const ICONS = {
  job: icon('ic_job'),
  blog: icon('ic_blog'),
  chat: icon('ic_chat'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  tour: icon('ic_tour'),
  order: icon('ic_order'),
  label: icon('ic_label'),
  blank: icon('ic_blank'),
  kanban: icon('ic_kanban'),
  folder: icon('ic_folder'),
  banking: icon('ic_banking'),
  booking: icon('ic_booking'),
  invoice: icon('ic_invoice'),
  product: icon('ic_product'),
  calendar: icon('ic_calendar'),
  disabled: icon('ic_disabled'),
  external: icon('ic_external'),
  menuItem: icon('ic_menu_item'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
  configuration: icon('ic_setting-2'),
  calculator: icon('calculator'),
  disbursement: icon('liquidate-icon'),
};

export function useNavData() {
  const { t } = useTranslate();

  const data = useMemo(
    () => [
      {
        subheader: t('overview'),
        items: [
          {
            title: t('dashboard'),
            path: paths.dashboard.root,
            icon: <DashboardIcon />,
          },
          hasPermission('liquidityApplicationProcess.calculator') && {
            title: t('liquidity calculator'),
            path: paths.loanCalculator,
            icon: <CalculateIcon />,
          },
          hasPermission('liquidityApplicationProcess.liquidityApplicationProcess') && {
            title: t('liquidity Application Process'),
            path: paths.liquidityApplication,
            icon: <ListAltIcon />,
          },

          hasPermission('liquidityPortfolio.view') && {
            title: t('liquidity portfolio'),
            path: paths.liquidityPortfolio,
            icon: <CreditScoreIcon />,
          },
          hasPermission('customerPortfolio.view') && {
            title: t('Customer portfolio'),
            path: paths.customerPortfolio,
            icon: <PortraitIcon />,
          },
          (hasPermission('transactionProcessingSystem.Below25kApprove') ||
            hasPermission('transactionProcessingSystem.Above25kApprove')) && {
            title: t('Transaction Processing System'),
            path: paths.liquidityDisbursement,
            icon: ICONS.disbursement,
          },
          hasPermission('payment.view') && {
            title: t('payment'),
            path: paths.payment,
            icon: <PaymentIcon />,
          },
          hasPermission('kyc.view') && {
            title: t('KYC'),
            path: paths.kyc,
            icon: <DocumentScannerIcon />,
          },
          hasPermission('appointment.view') && {
            title: t('appointment'),
            path: paths.appointment,
            icon: <InsertInvitationIcon />,
          },
          hasPermission('customer.view') && {
            title: t('customer'),
            path: paths.customer,
            icon: <AccountCircleIcon />,
          },
          hasPermission('store.view') && {
            title: t('store'),
            path: paths.store,
            icon: <StorefrontIcon />,
          },

          hasPermission('user.view') && {
            title: t('user'),
            path: paths.user,
            icon: <AdminPanelSettingsIcon />,
          },
          hasPermission('role&Permissions.view') && {
            title: t('Role & Permissions'),
            path: paths.role,
            icon: <ManageAccountsIcon />,
          },

          (hasPermission('priceTag.view') ||
            hasPermission('globalConfig.view') ||
            hasPermission('store.storeConfiguration') ||
            hasPermission('emailTemplate.view') ||
            hasPermission('agreementTemplate.view') ||
            hasPermission('messageTemplate.view') ||
            hasPermission('notificationTemplate.view')) && {
            title: t('Configuration'),
            path: paths.configuration.root,
            icon: <SettingsIcon />,
            children: [
              hasPermission('priceTag.view') && {
                title: t('price(tag)'),
                path: paths.configuration.tag,
              },
              hasPermission('globalConfig.view') && {
                title: t('global config'),
                path: paths.configuration.globalConfig,
              },
              hasPermission('store.storeConfiguration') && {
                title: t('Store Management'),
                path: paths.configuration.store,
              },
              hasPermission('emailTemplate.view') && {
                title: t('email template'),
                path: paths.configuration.email,
              },
              hasPermission('agreementTemplate.view') && {
                title: t('agreement template'),
                path: paths.configuration.agreement,
              },
              hasPermission('messageTemplate.view') && {
                title: t('message template'),
                path: paths.configuration.message,
              },
              hasPermission('notificationTemplate.view') && {
                title: t('notification template'),
                path: paths.configuration.notification,
              },

              hasPermission('globalConfig.view') && {
                title: t('tenure'),
                path: paths.configuration.tenure,
              },
            ].filter(Boolean),
          },
          hasPermission('help&Support.view') && {
            title: t('Help & Support'),
            path: paths.helpSupport,
            icon: <SupportAgentIcon />,
          },
        ].filter(Boolean),
      },
    ],
    [t]
  );

  return data;
}
