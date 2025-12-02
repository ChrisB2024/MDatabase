'use client';

import { Modal, Button, TextInput, NumberInput, Textarea, Select, Group } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useState, useEffect } from 'react';
import { workHoursApi, employeeApi } from '@/lib/api';
import type { WorkHours, WorkHoursCreate, Employee } from '@/types';

interface EditWorkHoursModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  workHours: WorkHours | null;
}

export default function EditWorkHoursModal({ opened, onClose, onSuccess, workHours }: EditWorkHoursModalProps) {
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

  // Pre-populate form with work hours data
  useEffect(() => {
    if (workHours) {
      form.setValues({
        employee_id: workHours.employee_id.toString(),
        date: workHours.date,
        hours_worked: workHours.hours_worked,
        overtime_hours: workHours.overtime_hours || 0,
        notes: workHours.notes || '',
        approved_by: workHours.approved_by || '',
        is_approved: workHours.is_approved,
      });
    }
  }, [workHours]);

  const handleSubmit = async (values: Omit<WorkHoursCreate, 'employee_id'> & { employee_id: string }) => {
    if (!workHours) return;

    setLoading(true);
    try {
      // Convert employee_id from string to number
      const data: WorkHoursCreate = {
        ...values,
        employee_id: parseInt(values.employee_id, 10),
      };

      await workHoursApi.update(workHours.record_id, data);
      
      notifications.show({
        title: 'Success',
        message: 'Work hours updated successfully',
        color: 'green',
      });
      
      form.reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      let errorMessage = 'Failed to update work hours';
      
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
      title="Edit Work Hours"
      size="lg"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Select
          label="Employee"
          placeholder="Select employee"
          data={employees}
          searchable
          required
          {...form.getInputProps('employee_id')}
          mb="md"
        />

        <DateInput
          label="Work Date"
          placeholder="Select date"
          value={form.values.date ? new Date(form.values.date) : null}
          onChange={(date) => {
            form.setFieldValue('date', date ? date.toISOString().split('T')[0] : '');
          }}
          required
          mb="md"
        />

        <NumberInput
          label="Hours Worked"
          placeholder="8"
          min={0}
          max={24}
          decimalScale={2}
          step={0.5}
          required
          {...form.getInputProps('hours_worked')}
          mb="md"
        />

        <NumberInput
          label="Overtime Hours"
          placeholder="0"
          min={0}
          max={24}
          decimalScale={2}
          step={0.5}
          description="Additional hours beyond regular shift"
          {...form.getInputProps('overtime_hours')}
          mb="md"
        />

        <TextInput
          label="Approved By"
          placeholder="Manager name (optional)"
          {...form.getInputProps('approved_by')}
          mb="md"
        />

        <Select
          label="Approval Status"
          data={[
            { value: 'true', label: 'Approved' },
            { value: 'false', label: 'Pending Approval' },
          ]}
          value={form.values.is_approved ? 'true' : 'false'}
          onChange={(value) => {
            form.setFieldValue('is_approved', value === 'true');
          }}
          mb="md"
        />

        <Textarea
          label="Notes"
          placeholder="Any additional notes about this work period"
          rows={3}
          {...form.getInputProps('notes')}
          mb="md"
        />

        <Group justify="flex-end" mt="xl">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Update Work Hours
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
