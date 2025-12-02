'use client';

import { Modal, Button, TextInput, NumberInput, Textarea, Select, Group } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useState, useEffect } from 'react';
import { workHoursApi, employeeApi } from '@/lib/api';
import type { WorkHoursCreate, Employee } from '@/types';

interface AddWorkHoursModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddWorkHoursModal({ opened, onClose, onSuccess }: AddWorkHoursModalProps) {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<{ value: string; label: string }[]>([]);

  const form = useForm<Omit<WorkHoursCreate, 'employee_id'> & { employee_id: string }>({
    initialValues: {
      employee_id: '',
      date: new Date().toISOString().split('T')[0],
      hours_worked: 0,
      overtime_hours: 0,
      notes: '',
      approved_by: '',
      is_approved: false,
    },
    validate: {
      employee_id: (value) => (!value ? 'Employee is required' : null),
      date: (value) => (!value ? 'Date is required' : null),
      hours_worked: (value) => {
        if (value === null || value === undefined) return 'Hours worked is required';
        if (value < 0) return 'Hours cannot be negative';
        if (value > 24) return 'Hours cannot exceed 24';
        return null;
      },
      overtime_hours: (value) => {
        if (value === null || value === undefined) return null;
        if (value < 0) return 'Overtime hours cannot be negative';
        if (value > 24) return 'Overtime hours cannot exceed 24';
        return null;
      },
    },
  });

  // Load employees for dropdown
  useEffect(() => {
    if (opened) {
      employeeApi.getAll()
        .then((response) => {
          const employeeOptions = response.data.map((emp: Employee) => ({
            value: emp.employee_id.toString(),
            label: `${emp.first_name} ${emp.last_name} (${emp.role})`,
          }));
          setEmployees(employeeOptions);
        })
        .catch((error) => {
          console.error('Failed to load employees:', error);
          notifications.show({
            title: 'Error',
            message: 'Failed to load employees',
            color: 'red',
          });
        });
    }
  }, [opened]);

  const handleSubmit = async (values: Omit<WorkHoursCreate, 'employee_id'> & { employee_id: string }) => {
    setLoading(true);
    try {
      // Convert employee_id from string to number
      const data: WorkHoursCreate = {
        ...values,
        employee_id: parseInt(values.employee_id, 10),
      };

      await workHoursApi.create(data);
      
      notifications.show({
        title: 'Success',
        message: 'Work hours logged successfully',
        color: 'green',
      });
      
      form.reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      let errorMessage = 'Failed to log work hours';
      
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
      title="Log Work Hours"
      size="lg"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Select
          label="Employee"
          placeholder="Select employee"
          required
          data={employees}
          searchable
          {...form.getInputProps('employee_id')}
          mb="md"
        />

        <DateInput
          label="Date"
          placeholder="Select date"
          required
          value={form.values.date ? new Date(form.values.date) : null}
          onChange={(date) => 
            form.setFieldValue('date', date?.toISOString().split('T')[0] || '')
          }
          mb="md"
        />

        <NumberInput
          label="Regular Hours Worked"
          placeholder="8.0"
          required
          min={0}
          max={24}
          decimalScale={2}
          step={0.5}
          {...form.getInputProps('hours_worked')}
          mb="md"
        />

        <NumberInput
          label="Overtime Hours"
          placeholder="0.0"
          min={0}
          max={24}
          decimalScale={2}
          step={0.5}
          {...form.getInputProps('overtime_hours')}
          mb="md"
        />

        <Textarea
          label="Notes"
          placeholder="Optional notes about this work entry"
          rows={3}
          {...form.getInputProps('notes')}
          mb="md"
        />

        <Group justify="flex-end" mt="xl">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Log Hours
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
