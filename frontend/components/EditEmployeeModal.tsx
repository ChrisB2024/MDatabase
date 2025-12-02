'use client';

import { useState, useEffect } from 'react';
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
import { Employee, EmployeeCreate } from '@/types';

interface EditEmployeeModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employee: Employee | null;
  taxProfiles: Array<{ value: string; label: string }>;
}

export default function EditEmployeeModal({
  opened,
  onClose,
  onSuccess,
  employee,
  taxProfiles,
}: EditEmployeeModalProps) {
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
  });

  useEffect(() => {
    if (employee) {
      form.setValues({
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: employee.email,
        phone: employee.phone || '',
        role: employee.role,
        start_date: employee.start_date,
        end_date: employee.end_date,
        status: employee.status,
        pay_type: employee.pay_type,
        hourly_rate: employee.hourly_rate,
        salary_amount: employee.salary_amount,
        overtime_rate: employee.overtime_rate,
        pay_periods_per_year: employee.pay_periods_per_year,
        tax_deduction_profile_id: employee.tax_deduction_profile_id,
        bank_account: employee.bank_account || '',
        routing_number: employee.routing_number || '',
        notes: employee.notes || '',
      });
    }
  }, [employee]);

  const handleSubmit = async (values: EmployeeCreate) => {
    if (!employee) return;
    
    setLoading(true);
    try {
      await employeeApi.update(employee.employee_id, values);
      notifications.show({
        title: 'Success',
        message: 'Employee updated successfully',
        color: 'green',
      });
      form.reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to update employee',
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
      title="Edit Employee"
      size="xl"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Grid mb="md">
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

        <Grid mb="md">
          <Grid.Col span={6}>
            <TextInput
              label="Email"
              placeholder="john.doe@example.com"
              required
              type="email"
              {...form.getInputProps('email')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Phone"
              placeholder="+234 XXX XXX XXXX"
              {...form.getInputProps('phone')}
            />
          </Grid.Col>
        </Grid>

        <Grid mb="md">
          <Grid.Col span={6}>
            <TextInput
              label="Role"
              placeholder="Software Engineer"
              required
              {...form.getInputProps('role')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="Status"
              data={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'terminated', label: 'Terminated' },
              ]}
              {...form.getInputProps('status')}
            />
          </Grid.Col>
        </Grid>

        <Grid mb="md">
          <Grid.Col span={6}>
            <Select
              label="Pay Type"
              data={[
                { value: 'hourly', label: 'Hourly' },
                { value: 'salaried', label: 'Salaried' },
              ]}
              required
              {...form.getInputProps('pay_type')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            {form.values.pay_type === 'hourly' ? (
              <NumberInput
                label="Hourly Rate"
                placeholder="5000.00"
                prefix="₦"
                decimalScale={2}
                min={0}
                {...form.getInputProps('hourly_rate')}
              />
            ) : (
              <NumberInput
                label="Annual Salary"
                placeholder="6000000.00"
                prefix="₦"
                decimalScale={2}
                min={0}
                {...form.getInputProps('salary_amount')}
              />
            )}
          </Grid.Col>
        </Grid>

        <Grid mb="md">
          <Grid.Col span={6}>
            <NumberInput
              label="Overtime Rate"
              placeholder="7500.00"
              prefix="₦"
              decimalScale={2}
              min={0}
              description="Rate for overtime hours (usually 1.5x regular)"
              {...form.getInputProps('overtime_rate')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <NumberInput
              label="Pay Periods Per Year"
              placeholder="12"
              min={1}
              max={52}
              description="Monthly = 12, Bi-weekly = 26, Weekly = 52"
              {...form.getInputProps('pay_periods_per_year')}
            />
          </Grid.Col>
        </Grid>

        <Select
          label="Tax & Deduction Profile"
          placeholder="Select profile"
          data={taxProfiles}
          clearable
          searchable
          {...form.getInputProps('tax_deduction_profile_id')}
          mb="md"
        />

        <Grid mb="md">
          <Grid.Col span={6}>
            <TextInput
              label="Bank Account Number"
              placeholder="0123456789"
              {...form.getInputProps('bank_account')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Bank Name / Sort Code"
              placeholder="GTBank / 058"
              {...form.getInputProps('routing_number')}
            />
          </Grid.Col>
        </Grid>

        <Grid mb="md">
          <Grid.Col span={6}>
            <DateInput
              label="Start Date"
              placeholder="Select date"
              value={form.values.start_date ? new Date(form.values.start_date) : null}
              onChange={(date) => {
                form.setFieldValue(
                  'start_date',
                  date ? date.toISOString().split('T')[0] : ''
                );
              }}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <DateInput
              label="End Date (if applicable)"
              placeholder="Select date"
              value={form.values.end_date ? new Date(form.values.end_date) : null}
              onChange={(date) => {
                form.setFieldValue(
                  'end_date',
                  date ? date.toISOString().split('T')[0] : undefined
                );
              }}
            />
          </Grid.Col>
        </Grid>

        <Textarea
          label="Notes"
          placeholder="Additional information about the employee"
          rows={3}
          {...form.getInputProps('notes')}
          mb="md"
        />

        <Group justify="flex-end" mt="xl">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Update Employee
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
