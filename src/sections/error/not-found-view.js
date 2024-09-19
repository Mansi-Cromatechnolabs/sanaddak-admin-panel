'use client';

import { m } from 'framer-motion';
import dynamic from 'next/dynamic';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { PageNotFoundIllustration } from 'src/assets/illustrations';

const CompactLayout = dynamic(() => import('src/layouts/compact'), { ssr: false });
const MotionContainer = dynamic(
  () => import('src/components/animate').then((mod) => mod.MotionContainer),
  { ssr: false }
);
const varBounce = dynamic(() => import('src/components/animate').then((mod) => mod.varBounce), {
  ssr: false,
});

export default function NotFoundView() {
  return (
    <CompactLayout>
      <MotionContainer>
        <m.div variants={varBounce().in}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            Sorry, Page Not Found!
          </Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <Typography sx={{ color: 'text.secondary' }}>
            Sorry, we couldn’t find the page you’re looking for. Perhaps you’ve mistyped the URL? Be
            sure to check your spelling.
          </Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <PageNotFoundIllustration
            sx={{
              height: 260,
              my: { xs: 5, sm: 10 },
            }}
          />
        </m.div>

        <Button component={RouterLink} href={paths.dashboard.root} size="large" variant="contained">
          Go to Dashboard
        </Button>
      </MotionContainer>
    </CompactLayout>
  );
}
