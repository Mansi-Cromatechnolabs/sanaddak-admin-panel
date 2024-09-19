'use client';

import { m } from 'framer-motion';
import dynamic from 'next/dynamic';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

import { SeverErrorIllustration } from 'src/assets/illustrations';

const CompactLayout = dynamic(() => import('src/layouts/compact'), { ssr: false });
const MotionContainer = dynamic(
  () => import('src/components/animate').then((mod) => mod.MotionContainer),
  { ssr: false }
);
const varBounce = dynamic(() => import('src/components/animate').then((mod) => mod.varBounce), {
  ssr: false,
});

export default function Page500() {
  return (
    <CompactLayout>
      <MotionContainer>
        <m.div variants={varBounce().in}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            500 Internal Server Error
          </Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <Typography sx={{ color: 'text.secondary' }}>
            There was an error, please try again later.
          </Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <SeverErrorIllustration sx={{ height: 260, my: { xs: 5, sm: 10 } }} />
        </m.div>

        <Button component={RouterLink} href="/" size="large" variant="contained">
          Go to Home
        </Button>
      </MotionContainer>
    </CompactLayout>
  );
}
