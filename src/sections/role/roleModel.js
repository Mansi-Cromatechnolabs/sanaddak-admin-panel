/* eslint-disable react/prop-types */
import * as Yup from 'yup';
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { Stack } from '@mui/system';
import Grow from '@mui/material/Grow';
import { LoadingButton } from '@mui/lab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {
  Grid,
  Checkbox,
  IconButton,
  Typography,
  DialogContent,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';

import { RHFTextField } from 'src/components/hook-form';
import FormProvider from 'src/components/hook-form/form-provider';

const modules = [
  {
    label: 'User',
    submodules: ['create', 'edit', 'view', 'delete'],
  },
  {
    label: 'Staff',
    submodules: ['create', 'edit', 'view', 'delete'],
  },
  {
    label: 'Gold Rate',
    submodules: ['maker', 'checker', 'approver'],
  },
  {
    label: 'Agreement Check',
    submodules: ['check'],
  },
];

export default function RoleModel({ open, onClose }) {
  const [expanded, setExpanded] = useState('');
  const PermissionSchema = Yup.object().shape({
    role: Yup.string().required('Role is required'),
    permissions: Yup.array().min(1, 'At least one permission must be selected'),
  });
  const defaultValues = { role: '', permissions: [] };
  const methods = useForm({
    resolver: yupResolver(PermissionSchema),
    defaultValues,
  });
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;
  const onSubmit = handleSubmit(async (data) => {
    try {
      console.log('data', data);
    } catch (error) {
      console.error(error);
    }
  });
  const handleCheckboxChange = (field, value) => (event) => {
    const { checked } = event.target;
    const currentPermissions = field.value || [];
    const updatedPermissions = checked
      ? [...currentPermissions, value]
      : currentPermissions.filter((permission) => permission !== value);
    field.onChange(updatedPermissions);
  };
  const toggleExpand = (moduleLabel) => {
    setExpanded(moduleLabel === expanded ? '' : moduleLabel);
  };
  const renderForm = (
    <>
      <Stack spacing={2.5}>
        <RHFTextField id="outlined-email" label="Enter Role" type="text" name="role" />
        <Grid container spacing={2}>
          {modules.map((module) => (
            <Grid item xs={12} key={module.label}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                  onClick={() => toggleExpand(module.label)}
                  size="small"
                  sx={{ marginRight: 1 }}
                >
                  {module.submodules.length > 0 &&
                    (expanded === module.label ? <ArrowDropDownIcon /> : <ArrowRightIcon />)}
                </IconButton>
                <Typography variant="h6">{module.label}</Typography>
              </div>
              {module.submodules.length > 0 && expanded === module.label && (
                <Grid container spacing={2} style={{ marginLeft: 24 }}>
                  {module.submodules.map((submodule) => (
                    <Grid item xs={6} sm={3} key={submodule}>
                      <Controller
                        name="permissions"
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={field.value.includes(`${module.label}:${submodule}`)}
                                onChange={handleCheckboxChange(
                                  field,
                                  `${module.label}:${submodule}`
                                )}
                              />
                            }
                            label={submodule}
                          />
                        )}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Grid>
          ))}
        </Grid>
        {errors.permissions && <FormHelperText error>{errors.permissions.message}</FormHelperText>}
      </Stack>
      <Stack spacing={2.5} justifyContent="flex-end">
        <div className="text-center pb-3">
          <LoadingButton
            color="inherit"
            size="medium"
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            Save
          </LoadingButton>
        </div>
      </Stack>
    </>
  );
  return (
    <div>
      <Dialog
        open={open}
        onClose={() => {
          onClose();
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{ '& .MuiDialog-paper': { width: 'auto' } }}
        TransitionProps={{
          onEntered: () => {},
        }}
        TransitionComponent={Grow}
      >
        <DialogTitle id="alert-dialog-title">Add Role</DialogTitle>
        <DialogContent>
          <div className="pt-2 pb-3">
            <FormProvider methods={methods} onSubmit={onSubmit}>
              {renderForm}
            </FormProvider>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
