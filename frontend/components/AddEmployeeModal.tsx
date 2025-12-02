'use client';

import { useState } from 'react';
import {
  Modal,
  TextInput,
  Select,
  Button,
  Group,
  NumberInput,
  Textarea,
  Stack,
  Grid,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { employeeApi } from '@/lib/api';
import { EmployeeCreate } from '@/types';

interface AddEmployeeModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  taxProfiles: Array<{ value: string; label: string }>;
}

export default function AddEmployeeModal({
  opened,
  onClose,
  onSuccess,
  taxProfiles,
}: AddEmployeeModalProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<EmployeeCreate>({
    initialValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      role: '',
      start_date: new Date().toISOString().split('T')[0],
      status: 'active',
      pay_type: 'hourly',
      hourly_rate: undefined,
      salary_amount: undefined,
      overtime_rate: undefined,
      pay_periods_per_year: 26,
      tax_deduction_profile_id: undefined,
      bank_account: '',
      routing_number: '',
      notes: '',
    },
    validate: {
      first_name: (value) => (!value ? 'First name is required' : null),
      last_name: (value) => (!value ? 'Last name is required' : null),
      email: (value) => {
        if (!value) return 'Email is required';
        if (!/^\S+@\S+$/.test(value)) return 'Invalid email';
        return null;
      },
      role: (value) => (!value ? 'Role is required' : null),
      pay_type: (value) => (!value ? 'Pay type is required' : null),
      hourly_rate: (value, values) => {
        if (values.pay_type === 'hourly' && !value) {
          return 'Hourly rate is required for hourly employees';
        }
        return null;
      },
      salary_amount: (value, values) => {
        if (values.pay_type === 'salary' && !value) {
          return 'Salary amount is required for salaried employees';
        }
        return null;
      },
    },
  });

  const handleSubmit = async (values: EmployeeCreate) => {
    setLoading(true);
    try {
      // Clean up the data based on pay type
      const cleanedData = { ...values };
      if (values.pay_type === 'hourly') {
        cleanedData.salary_amount = undefined;
      } else {
        cleanedData.hourly_rate = undefined;
        cleanedData.overtime_rate = undefined;
      }

      // Remove empty strings
      Object.keys(cleanedData).forEach((key) => {
        const typedKey = key as keyof EmployeeCreate;
        if (cleanedData[typedKey] === '') {
          delete (cleanedData as any)[typedKey];
        }
      });

      await employeeApi.create(cleanedData);
      
      notifications.show({
        title: 'Success',
        message: 'Employee added successfully',
        color: 'green',
      });

      form.reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error adding employee:', error);
      
      let errorMessage = 'Failed to add employee';
      
      if (error.response?.data?.detail) {
        // Handle array of errors from FastAPI
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail
            .map((err: any) => `${err.loc?.join(' → ') || 'Field'}: ${err.msg}`)
            .join(', ');
        } else if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else if (typeof error.response.data.detail === 'object') {
          errorMessage = JSON.stringify(error.response.data.detail);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Add New Employee"
      size="xl"
      closeOnClickOutside={!loading}
      closeOnEscape={!loading}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {/* Personal Information */}
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="First Name"
                placeholder="John"
                required
                {...form.getInputProps('first_name')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Last Name"
                placeholder="Doe"
                required
                {...form.getInputProps('last_name')}
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="Email"
                placeholder="john.doe@company.com"
                required
                type="email"
                {...form.getInputProps('email')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Phone"
                placeholder="(555) 123-4567"
                {...form.getInputProps('phone')}
              />
            </Grid.Col>
          </Grid>

          {/* Employment Information */}
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="Role/Position"
                placeholder="Software Engineer"
                required
                {...form.getInputProps('role')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <DateInput
                label="Start Date"
                placeholder="Select date"
                required
                value={form.values.start_date ? new Date(form.values.start_date) : null}
                onChange={(date) => 
                  form.setFieldValue('start_date', date?.toISOString().split('T')[0] || '')
                }
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={6}>
              <Select
                label="Employment Status"
                placeholder="Select status"
                required
                data={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
                {...form.getInputProps('status')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Pay Type"
                placeholder="Select pay type"
                required
                data={[
                  { value: 'hourly', label: 'Hourly' },
                  { value: 'salary', label: 'Salary' },
                ]}
                {...form.getInputProps('pay_type')}
              />
            </Grid.Col>
          </Grid>

          {/* Pay Information */}
          {form.values.pay_type === 'hourly' ? (
            <Grid>
              <Grid.Col span={6}>
                <NumberInput
                  label="Hourly Rate"
                  placeholder="5000.00"
                  required
                  prefix="₦"
                  decimalScale={2}
                  min={0}
                  {...form.getInputProps('hourly_rate')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <NumberInput
                  label="Overtime Rate"
                  placeholder="7500.00"
                  prefix="₦"
                  decimalScale={2}
                  min={0}
                  description="Leave empty to auto-calculate (1.5x hourly rate)"
                  {...form.getInputProps('overtime_rate')}
                />
              </Grid.Col>
            </Grid>
          ) : (
            <Grid>
              <Grid.Col span={6}>
                <NumberInput
                  label="Annual Salary"
                  placeholder="6000000.00"
                  required
                  prefix="₦"
                  decimalScale={2}
                  min={0}
                  {...form.getInputProps('salary_amount')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <NumberInput
                  label="Pay Periods Per Year"
                  placeholder="12"
                  required
                  min={1}
                  max={365}
                  description="E.g., 12 for monthly, 26 for bi-weekly"
                  {...form.getInputProps('pay_periods_per_year')}
                />
              </Grid.Col>
            </Grid>
          )}

          {/* Tax and Banking */}
          <Select
            label="Tax & Deduction Profile"
            placeholder="Select profile (optional)"
            data={taxProfiles}
            clearable
            searchable
            value={form.values.tax_deduction_profile_id?.toString()}
            onChange={(value) => 
              form.setFieldValue('tax_deduction_profile_id', value ? parseInt(value) : undefined)
            }
          />

          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="Bank Account Number"
                placeholder="****1234"
                {...form.getInputProps('bank_account')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Routing Number"
                placeholder="123456789"
                {...form.getInputProps('routing_number')}
              />
            </Grid.Col>
          </Grid>

          {/* Notes */}
          <Textarea
            label="Notes"
            placeholder="Additional information about the employee..."
            minRows={3}
            {...form.getInputProps('notes')}
          />

          {/* Actions */}
          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Add Employee
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
