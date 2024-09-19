/* eslint-disable no-nested-ternary */
/* eslint-disable no-const-assign */
/* eslint-disable arrow-body-style */
/* eslint-disable react-hooks/exhaustive-deps */

'use client';

/* eslint-disable react/prop-types */

import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { Box, Stack } from '@mui/system';
import { LoadingButton } from '@mui/lab';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Grid,
  Card,
  Paper,
  Checkbox,
  Accordion,
  Typography,
  FormHelperText,
  FormControlLabel,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import useFocusOnMount from 'src/hooks/use-focus-on-mount';

import { handleLoader } from 'src/utils/loader';
import { hasPermission } from 'src/utils/permissionUtils';

import { grey } from 'src/theme/palette';
import ApiCalling from 'src/ApiCalling/ApiCalling';

import { RHFTextField } from 'src/components/hook-form';
import FormProvider from 'src/components/hook-form/form-provider';
import ToasteMessage from 'src/components/toaste-message/ToasteMessage';
import Loader from 'src/components/loader/Loader';
import NoResultFound from 'src/components/sanaddak/NoDataFound';

export default function RoleNewEditForm({ id }) {
  const router = useRouter();
  const [permissionList, setPermissionList] = useState([]);
  const [expanded, setExpanded] = useState([]);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isNotEditable, setIsNotEditable] = useState(false);

  const firstFieldRef = useFocusOnMount();
  const [customLoading, setCustomLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(true);

  const getPermissionsList = () => {
    ApiCalling.apiCallGet('tanant/permission/list')
      .then((res) => {
        if (res.data) {
          const groupedPermissions = groupPermissions(res.data.data);
          setPermissionList(groupedPermissions);
          setExpanded(groupedPermissions.map((_, index) => index));
          const defaultPermissions = groupedPermissions.flatMap((module) =>
            module.submodules.filter((sub) => sub.is_enable).map((sub) => sub.id)
          );
          setHasData(true);
          reset({
            role: '',
            permissions: defaultPermissions,
          });
        }
        else {
          setHasData(false);
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const getPermissionsByRoleId = () => {
    ApiCalling.apiCallPost(`role_permissions?role_id=${id}`)
      .then((res) => {
        if (res.data) {
          setLoading(false);
          const groupedPermissions = groupPermissionsByRoleId(res.data.data.permission);
          setIsNotEditable(res.data.data.not_deletable);
          setPermissionList(groupedPermissions);
          setExpanded(groupedPermissions.map((_, index) => index));
          const defaultPermissions = groupedPermissions.flatMap((module) =>
            module.submodules.filter((sub) => sub.is_enable).map((sub) => sub.id)
          );
          setHasData(true);
          reset({
            role: res.data.data.role_name,
            permissions: defaultPermissions,
          });
        } else {
          setHasData(false);
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const formatModuleName = (moduleName) => {
    const words = moduleName
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
      .replace(/([^\w\s])/g, ' $1 ')

      .split(' ');

    const capitalizedWords = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1));

    return capitalizedWords.join(' ');
  };
  const groupPermissions = (permissions) => {
    const grouped = permissions.reduce((acc, permission) => {
      const [module, submodule] = permission.name.split('.');
      const formattedModuleName = formatModuleName(module);
      const formattedSubModuleName = formatModuleName(submodule);

      if (!acc[module]) {
        acc[module] = {
          label: formattedModuleName,
          submodules: [],
        };
      }
      acc[module].submodules.push({
        name: formattedSubModuleName,
        id: permission.id,
        is_enable: false,
      });
      return acc;
    }, {});
    return Object.values(grouped);
  };

  const groupPermissionsByRoleId = (permissions) => {
    const grouped = permissions.reduce((acc, permission) => {
      if (permission.permissions && permission.permissions.name) {
        const [module, submodule] = permission.permissions.name.split('.');
        const formattedModuleName = formatModuleName(module);
        const formattedSubModuleName = formatModuleName(submodule);
        if (!acc[module]) {
          acc[module] = {
            label: formattedModuleName,
            submodules: [],
          };
        }
        acc[module].submodules.push({
          name: formattedSubModuleName,
          id: permission.permissions._id,
          is_enable: permission.is_enable,
        });
      }
      return acc;
    }, {});

    return Object.values(grouped);
  };

  useEffect(() => {
    if (id) {
      getPermissionsByRoleId();
    } else {
      getPermissionsList();
    }
  }, [id]);

  const handleAccordionChange = (index) => {
    setExpanded((prevExpanded) =>
      prevExpanded.includes(index)
        ? prevExpanded.filter((i) => i !== index)
        : [...prevExpanded, index]
    );
  };

  const PermissionSchema = Yup.object().shape({
    role: Yup.string().required('Role is required'),
    permissions: Yup.array()
      .min(1, 'At least one permission must be selected')
      .test(
        'hasAtLeastOnePermission',
        'At least one permission must be selected',
        (permissions) => {
          return permissions.some((permission) => permission.length > 0);
        }
      ),
  });
  const defaultValues = { role: '', permissions: [] };
  const methods = useForm({
    resolver: yupResolver(PermissionSchema),
    defaultValues,
  });
  const {
    control,
    reset,
    watch,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = methods;

  const watchFields = watch('role');
  const permissions = watch('permissions') || [];

  const handleFullAccessChange = (event) => {
    const { checked } = event.target;
    if (checked) {
      const allPermissions = permissionList.flatMap((module) =>
        module.submodules.map((submodule) => submodule.id)
      );
      setValue('permissions', allPermissions);
    } else {
      setValue('permissions', []);
    }
  };

  const isModuleSelected = (module) =>
    module.submodules.every((submodule) => permissions.includes(submodule.id));

  const isModuleIndeterminate = (module) =>
    module.submodules.some((submodule) => permissions.includes(submodule.id)) &&
    !isModuleSelected(module);

  const handleModuleCheckboxChange = (module, isChecked) => {
    const modulePermissions = module.submodules.map((submodule) => submodule.id);

    const updatedPermissions = isChecked
      ? [...new Set([...permissions, ...modulePermissions])]
      : permissions.filter((pid) => !modulePermissions.includes(pid));

    setValue('permissions', updatedPermissions);
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (id) {
        await handleRoleUpdate(data);
      } else {
        await handleRoleAdd(data);
      }
    } catch (error) {
      console.error(error);
    }
  });

  useEffect(() => {
    const { role } = getValues();
    setIsFormValid(!!role);
  }, [watchFields, getValues]);

  const handleRoleAdd = async (data) => {
    setCustomLoading(true);
    try {
      const apiData = {
        name: data.role,
      };
      const response = await ApiCalling.apiCallPost(`tanant/role/create`, apiData);
      if (response.data) {
        const roleId = response.data.data.id;
        setTimeout(() => {
          setCustomLoading(false);
          addPermission(roleId);
          ToasteMessage(response?.data?.message, 'success');
        }, 2000);
      } else {
        console.log('error');
        handleLoader(setCustomLoading, false, 500);
      }
    } catch (error) {
      console.error(error);
      handleLoader(setCustomLoading, false, 500);
    }
  };

  const handleRoleUpdate = async (data) => {
    setCustomLoading(true);
    try {
      const apiData = {
        id,
        name: data.role,
      };
      const response = await ApiCalling.apiCallPut(`tanant/role/update`, apiData);
      if (response.data) {
        setTimeout(() => {
          setCustomLoading(false);
          addPermission(id);
          ToasteMessage(response.data.message, 'success');
        }, 2000);
      } else {
        console.log('error');
        handleLoader(setCustomLoading, false, 500);
      }
    } catch (error) {
      console.error(error);
      handleLoader(setCustomLoading, false, 500);
    }
  };
  const addPermission = (roleId) => {
    const apiData = {
      role_id: roleId,
      permission_ids: getValues('permissions'),
    };
    ApiCalling.apiCallPost('assign/role/permission', apiData)
      .then((res) => {
        if (res.data) {
          reset();
          router.push(paths.role);
        } else {
          console.log('error');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const renderForm = (
    <>
      <Stack spacing={2.5} mt={2} mb={2}>
        <Box display="flex" gap={2} alignItems="center">
          <RHFTextField
            id="outlined-email"
            label="Enter Role"
            type="text"
            name="role"
            sx={{
              '& .MuiInputLabel-formControl': {
                fontSize: 14,
              },
            }}
            inputRef={firstFieldRef}
            disabled={!hasPermission('role&Permissions.update') || isNotEditable}
          />

          <Controller
            name="fullAcess"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={
                      watch('permissions').length ===
                      permissionList.flatMap((module) => module.submodules).length
                    }
                    onChange={(event) => {
                      field.onChange(event.target.checked);
                      handleFullAccessChange(event);
                    }}
                    disabled={!hasPermission('role&Permissions.update') || isNotEditable}
                  />
                }
                label="Full Access"
                sx={{
                  textWrap: 'nowrap',
                  '& .MuiCheckbox-root': {
                    fontSize: '14px',
                  },
                  '& .MuiFormControlLabel-label': {
                    fontSize: '14px',
                  },
                }}
              />
            )}
          />
        </Box>

        <Grid container spacing={2}>
          {permissionList.map((module, index) => (
            <Grid item xs={6} key={module.label}>
              <Accordion
                className={`${expanded.includes(index) && 'h-100'}`}
                expanded={expanded.includes(index)}
              >
                <AccordionSummary
                  sx={
                    expanded.includes(index) && {
                      borderBottom: 1,
                      borderColor: grey[300],
                      '.MuiAccordionSummary-content.Mui-expanded': { my: 0 },
                    }
                  }
                  expandIcon={<ExpandMoreIcon onClick={() => handleAccordionChange(index)} />}
                  aria-controls={`${module.label}-content`}
                  id={`${module.label}-header`}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    width="100%"
                  >
                    <Typography variant="h3">{module.label}</Typography>
                  </Box>
                  <Box>
                    <Checkbox
                      checked={isModuleSelected(module)}
                      indeterminate={isModuleIndeterminate(module)}
                      onChange={(e) => handleModuleCheckboxChange(module, e.target.checked)}
                      disabled={!hasPermission('role&Permissions.update') || isNotEditable}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {module.submodules.map((submodule, i) => (
                      <Grid item minWidth={150} key={i}>
                        <Controller
                          name="permissions"
                          control={control}
                          render={({ field }) => (
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={field.value.includes(submodule.id)}
                                  onChange={(event) => {
                                    const { checked } = event.target;
                                    let updatedPermissions = checked
                                      ? [...field.value, submodule.id]
                                      : field.value.filter(
                                        (permission) => permission !== submodule.id
                                      );

                                    if (
                                      checked &&
                                      submodule.name !== 'View' &&
                                      module.submodules.some(
                                        (sub) =>
                                          sub.name === 'View' &&
                                          !updatedPermissions.includes(sub.id)
                                      )
                                    ) {
                                      const viewPermission = module.submodules.find(
                                        (sub) => sub.name === 'View'
                                      );
                                      if (viewPermission) {
                                        updatedPermissions.push(viewPermission.id);
                                      }
                                    }
                                    if (
                                      !checked &&
                                      submodule.name === 'View' &&
                                      updatedPermissions.some((perm) =>
                                        module.submodules.some(
                                          (sub) => sub.id === perm && sub.name !== 'View'
                                        )
                                      )
                                    ) {
                                      updatedPermissions = updatedPermissions.filter(
                                        (perm) => perm !== submodule.id
                                      );
                                    }
                                    field.onChange(updatedPermissions);
                                  }}
                                  disabled={
                                    !hasPermission('role&Permissions.update') || isNotEditable
                                  }
                                />
                              }
                              label={submodule.name}
                            />
                          )}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>
          ))}
        </Grid>
        {errors.permissions && <FormHelperText error>{errors.permissions.message}</FormHelperText>}
      </Stack>
      <Stack spacing={2.5}>
        <div className="text-end d-flex justify-content-end gap-2 pb-1">
          {hasPermission('role&Permissions.update') && !isNotEditable && (
            <LoadingButton
              color="inherit"
              size="medium"
              type="submit"
              variant="contained"
              loading={customLoading}
              disabled={!isFormValid}
            >
              Save
            </LoadingButton>
          )}
        </div>
      </Stack>
    </>
  );
  return (
    <div>
      {loading ? (
        <Loader />
      ) : hasData ? (
        <Card
          sx={{
            p: 2,
            boxShadow: 'none',
            borderRadius: 1.5,
            color: (theme) => (theme.palette.mode === 'light' ? 'primary.darker' : 'primary.lighter'),
            border: (theme) => `1px solid ${theme.palette.text.lightGrey}`,
          }}
        >
          <Paper sx={{ padding: 2 }}>
            <FormProvider methods={methods} onSubmit={onSubmit}>
              {renderForm}
            </FormProvider>
          </Paper>
        </Card>
      ) : (
        <NoResultFound />
      )}
    </div>
  );
}
