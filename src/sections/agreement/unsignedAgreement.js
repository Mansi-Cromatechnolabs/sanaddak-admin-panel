/* eslint-disable no-lonely-if */
/* eslint-disable no-nested-ternary */
/* eslint-disable react/no-danger */
/* eslint-disable react-hooks/exhaustive-deps */

import * as Yup from 'yup';
import ReactToPrint from 'react-to-print';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { yupResolver } from '@hookform/resolvers/yup';
/* eslint-disable react/prop-types */
import React, { useRef, useState, useEffect } from 'react';

import { Stack } from '@mui/system';
import { LoadingButton } from '@mui/lab';
import Accordion from '@mui/material/Accordion';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import {
  Card,
  Grid,
  Grow,
  Dialog,
  Typography,
  CardContent,
  DialogTitle,
  DialogContent,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import ApiCalling from 'src/ApiCalling/ApiCalling';
import { AgreementType, ApplicationStatus } from 'src/ENUMS/enums';

import RHFTextArea from 'src/components/hook-form/rhf-textArea';
import FormProvider from 'src/components/hook-form/form-provider';
import ToasteMessage from 'src/components/toaste-message/ToasteMessage';

import { PrintableContent } from './printableContent';

export default function UnsignedAgreement({ data, loanId }) {
  const router = useRouter();
  const [agreementList, setAgreementList] = useState([]);
  const [customerApproval, setCustomerApproval] = useState(null);
  const componentRef = useRef();

  const getCustomerApproval = () => {
    ApiCalling.apiCallGet(`appointment/application_status?loan_id=${loanId}`)
      .then((res) => {
        if (res.data) {
          setCustomerApproval(res.data.data);
        } else {
        }
      })
      .catch((error) => {
        console.log('error', error);
      });
  };

  useEffect(() => {
    getCustomerApproval();
  }, []);

  useEffect(() => {
    if (data) {
      setAgreementList(data);
    }
  }, [data]);

  const TenureSchema = Yup.object().shape({
    reason: Yup.string().required('This field is required'),
  });

  const firstFieldRef = useRef();

  const defaultValues = {
    reason: '',
  };
  const methods = useForm({
    resolver: yupResolver(TenureSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
  } = methods;

  const onSubmit = handleSubmit(async (d) => {
    try {
      const apiData = {
        loan_id: loanId,
        application_status: 7,
        reason_for_rejection: d.reason,
      };
      ApiCalling.apiCallPatch('appointment/application_status', apiData)
        .then((res) => {
          if (res.data) {
            setCustomerApproval(false);
            ToasteMessage('Reason updated successfully', 'success');
            router.push(paths.loanCalculator);
          } else {
            if (res?.response?.data) {
              reset({ reason: res?.response?.data?.message });
            }
          }
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (error) {
      console.error(error);
      reset();
    }
  });

  const renderForm = (
    <Stack spacing={2.5}>
      <RHFTextArea
        id="outlined-email"
        label="Reason for disapprove"
        type="text"
        name="reason"
        inputRef={firstFieldRef}
      />
      <div className="text-center pb-3">
        <LoadingButton
          color="inherit"
          size="large"
          type="submit"
          variant="contained"
        >
          Save
        </LoadingButton>
      </div>
    </Stack>
  );

  return (
    <div>
      <Card>
        <CardContent>
          {agreementList.map((a, i) => (
            <Accordion
              key={i}
              defaultExpanded={i === 0}
              sx={{ '.MuiAccordionSummary-root.Mui-expanded': { minHeight: 48 } }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
                sx={{ '.MuiAccordionSummary-content': { my: 0, fontWeight: 500 } }}
              >
                {a.name}
              </AccordionSummary>
              <AccordionDetails sx={{ borderTop: '1px solid #DFE3E8' }}>
                <div dangerouslySetInnerHTML={{ __html: a.body }} />
              </AccordionDetails>
            </Accordion>
          ))}
        </CardContent>

        <Grid display="flex" justifyContent="center">
          <ReactToPrint
            trigger={() => (
              <LoadingButton
                color="inherit"
                size="small"
                variant="contained"
                sx={{
                  marginTop: 2,
                  marginBottom: 2,
                  marginRight: 2,
                }}
                disabled={
                  agreementList[0]?.agreement_type === AgreementType.MURABAHA &&
                  !(customerApproval?.application_status === ApplicationStatus.APPROVED_BY_CUSTOMER)
                }
              >
                Print
              </LoadingButton>
            )}
            content={() => componentRef?.current}
          />
        </Grid>
      </Card>

      <div style={{ display: 'none' }}>
        <PrintableContent ref={componentRef} agreements={agreementList} />
      </div>
      <Dialog
        open={customerApproval?.application_status === ApplicationStatus.REJECT_BY_CUSTOMER}
        onClose={() => {
          setCustomerApproval(false);
          reset({ reason: '' });
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{ '& .MuiDialog-paper': { width: '80%' } }}
        maxWidth="xs"
        TransitionProps={{
          onEntered: () => {
            if (firstFieldRef.current) {
              firstFieldRef.current.focus();
            }
          },
        }}
        TransitionComponent={Grow}
      >
        <DialogTitle id="alert-dialog-title">
          <Typography variant="h2">Reason for DisApprove</Typography>
        </DialogTitle>
        <DialogContent>
          <div className="pt-3 pb-3">
            <FormProvider methods={methods} onSubmit={onSubmit}>
              {renderForm}
            </FormProvider>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
