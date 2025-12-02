'use client';

import { Modal, Button, TextInput, NumberInput, Textarea, Group, Grid } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { taxProfileApi } from '@/lib/api';
import type { TaxDeductionProfileCreate } from '@/types';

interface AddTaxProfileModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddTaxProfileModal({ opened, onClose, onSuccess }: AddTaxProfileModalProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<TaxDeductionProfileCreate>({
    initialValues: {
      profile_name: '',
      federal_tax_rate: 0.24,        // Nigerian PIT max rate 24%
      state_tax_rate: 0,             // State taxes vary
      local_tax_rate: 0,             // Local taxes vary
      social_security_rate: 0.10,    // Employer pension contribution 10%
      medicare_rate: 0.025,          // National Housing Fund 2.5%
      retirement_withholding: 0,
      health_insurance: 0,
      dental_insurance: 0,
      vision_insurance: 0,
      other_deductions: 0,
      description: '',
    },
    validate: {
      profile_name: (value) => (!value ? 'Profile name is required' : null),
      federal_tax_rate: (value) => {
        if (value === null || value === undefined) return null;
        if (value < 0 || value > 1) return 'Rate must be between 0 and 1 (0% to 100%)';
        return null;
      },
      state_tax_rate: (value) => {
        if (value === null || value === undefined) return null;
        if (value < 0 || value > 1) return 'Rate must be between 0 and 1 (0% to 100%)';
        return null;
      },
    },
  });

  const handleSubmit = async (values: TaxDeductionProfileCreate) => {
    setLoading(true);
    try {
      await taxProfileApi.create(values);
      
      notifications.show({
        title: 'Success',
        message: 'Tax profile created successfully',
        color: 'green',
      });
      
      form.reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      let errorMessage = 'Failed to create tax profile';
      
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (Array.isArray(detail)) {
          errorMessage = detail.map((err: any) => err.msg).join(', ');
        } else if (typeof detail === 'object') {
          errorMessage = JSON.stringify(detail);
        } else {
          errorMessage = String(detail);
        }
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
      title="Add Tax & Deduction Profile"
      size="xl"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="Profile Name"
          placeholder="Standard Employee Profile"
          required
          {...form.getInputProps('profile_name')}
          mb="md"
        />

        <Textarea
          label="Description"
          placeholder="Optional description for this profile"
          rows={2}
          {...form.getInputProps('description')}
          mb="md"
        />

        <Grid mb="md">
          <Grid.Col span={6}>
            <NumberInput
              label="Personal Income Tax (PIT) Rate"
              placeholder="0.24"
              min={0}
              max={1}
              decimalScale={4}
              step={0.01}
              prefix="₦"
              description="Enter as decimal (e.g., 0.24 for 24%)"
              {...form.getInputProps('federal_tax_rate')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <NumberInput
              label="State Tax Rate"
              placeholder="0.00"
              min={0}
              max={1}
              decimalScale={4}
              step={0.01}
              description="Varies by state"
              {...form.getInputProps('state_tax_rate')}
            />
          </Grid.Col>
        </Grid>

        <Grid mb="md">
          <Grid.Col span={6}>
            <NumberInput
              label="Local Tax Rate"
              placeholder="0.00"
              min={0}
              max={1}
              decimalScale={4}
              step={0.01}
              {...form.getInputProps('local_tax_rate')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <NumberInput
              label="Pension Contribution Rate"
              placeholder="0.10"
              min={0}
              max={1}
              decimalScale={4}
              step={0.001}
              description="Employer minimum 10%"
              {...form.getInputProps('social_security_rate')}
            />
          </Grid.Col>
        </Grid>

        <Grid mb="md">
          <Grid.Col span={6}>
            <NumberInput
              label="National Housing Fund (NHF) Rate"
              placeholder="0.025"
              min={0}
              max={1}
              decimalScale={4}
              step={0.001}
              description="Usually 2.5% of basic salary"
              {...form.getInputProps('medicare_rate')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <NumberInput
              label="Additional Pension Withholding"
              placeholder="0.00"
              min={0}
              prefix="₦"
              decimalScale={2}
              description="Fixed amount per pay period"
              {...form.getInputProps('retirement_withholding')}
            />
          </Grid.Col>
        </Grid>

        <Grid mb="md">
          <Grid.Col span={4}>
            <NumberInput
              label="Health Insurance"
              placeholder="0.00"
              min={0}
              prefix="₦"
              decimalScale={2}
              {...form.getInputProps('health_insurance')}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <NumberInput
              label="Dental Insurance"
              placeholder="0.00"
              min={0}
              prefix="₦"
              decimalScale={2}
              {...form.getInputProps('dental_insurance')}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <NumberInput
              label="Vision Insurance"
              placeholder="0.00"
              min={0}
              prefix="₦"
              decimalScale={2}
              {...form.getInputProps('vision_insurance')}
            />
          </Grid.Col>
        </Grid>

        <NumberInput
          label="Other Deductions"
          placeholder="0.00"
          min={0}
          prefix="₦"
          decimalScale={2}
          description="Any other fixed deductions (Development Levy, WHT, etc.)"
          {...form.getInputProps('other_deductions')}
          mb="md"
        />

        <Group justify="flex-end" mt="xl">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create Profile
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
