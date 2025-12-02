'use client';

import { Modal, Text, Grid, Badge, Divider, Group, Stack } from '@mantine/core';
import { Employee } from '@/types';
import { formatNaira, formatPercentage } from '@/lib/utils';

interface ViewEmployeeModalProps {
  opened: boolean;
  onClose: () => void;
  employee: Employee | null;
}

export default function ViewEmployeeModal({ opened, onClose, employee }: ViewEmployeeModalProps) {
  if (!employee) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Employee Details: ${employee.first_name} ${employee.last_name}`}
      size="lg"
      centered
    >
      <Stack gap="md">
        {/* Personal Information */}
        <div>
          <Text fw={700} size="sm" mb="xs">Personal Information</Text>
          <Grid>
            <Grid.Col span={6}>
              <Text size="sm" c="dimmed">Employee ID</Text>
              <Text size="sm" fw={500}>#{employee.employee_id}</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="sm" c="dimmed">Status</Text>
              <Badge color={employee.status === 'active' ? 'green' : 'gray'}>
                {employee.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="sm" c="dimmed">Email</Text>
              <Text size="sm" fw={500}>{employee.email}</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="sm" c="dimmed">Phone</Text>
              <Text size="sm" fw={500}>{employee.phone || 'N/A'}</Text>
            </Grid.Col>
          </Grid>
        </div>

        <Divider />

        {/* Employment Information */}
        <div>
          <Text fw={700} size="sm" mb="xs">Employment Information</Text>
          <Grid>
            <Grid.Col span={6}>
              <Text size="sm" c="dimmed">Role/Position</Text>
              <Text size="sm" fw={500}>{employee.role}</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="sm" c="dimmed">Start Date</Text>
              <Text size="sm" fw={500}>
                {new Date(employee.start_date).toLocaleDateString()}
              </Text>
            </Grid.Col>
            {employee.end_date && (
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">End Date</Text>
                <Text size="sm" fw={500}>
                  {new Date(employee.end_date).toLocaleDateString()}
                </Text>
              </Grid.Col>
            )}
          </Grid>
        </div>

        <Divider />

        {/* Compensation */}
        <div>
          <Text fw={700} size="sm" mb="xs">Compensation</Text>
          <Grid>
            <Grid.Col span={6}>
              <Text size="sm" c="dimmed">Pay Type</Text>
              <Badge color={employee.pay_type === 'hourly' ? 'blue' : 'green'}>
                {employee.pay_type === 'hourly' ? 'Hourly' : 'Salary'}
              </Badge>
            </Grid.Col>
            {employee.pay_type === 'hourly' ? (
              <>
                <Grid.Col span={6}>
                  <Text size="sm" c="dimmed">Hourly Rate</Text>
                  <Text size="sm" fw={700} c="blue">
                    {formatNaira(employee.hourly_rate || 0)}
                  </Text>
                </Grid.Col>
                {employee.overtime_rate && (
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed">Overtime Rate</Text>
                    <Text size="sm" fw={700} c="blue">
                      {formatNaira(employee.overtime_rate)}
                    </Text>
                  </Grid.Col>
                )}
              </>
            ) : (
              <>
                <Grid.Col span={6}>
                  <Text size="sm" c="dimmed">Annual Salary</Text>
                  <Text size="sm" fw={700} c="green">
                    {formatNaira(employee.salary_amount || 0)}
                  </Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="sm" c="dimmed">Pay Periods</Text>
                  <Text size="sm" fw={500}>{employee.pay_periods_per_year} per year</Text>
                </Grid.Col>
              </>
            )}
          </Grid>
        </div>

        <Divider />

        {/* Banking Information */}
        <div>
          <Text fw={700} size="sm" mb="xs">Banking Information</Text>
          <Grid>
            <Grid.Col span={6}>
              <Text size="sm" c="dimmed">Bank Account</Text>
              <Text size="sm" fw={500}>{employee.bank_account || 'Not provided'}</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="sm" c="dimmed">Routing Number</Text>
              <Text size="sm" fw={500}>{employee.routing_number || 'Not provided'}</Text>
            </Grid.Col>
          </Grid>
        </div>

        {/* Notes */}
        {employee.notes && (
          <>
            <Divider />
            <div>
              <Text fw={700} size="sm" mb="xs">Notes</Text>
              <Text size="sm">{employee.notes}</Text>
            </div>
          </>
        )}

        {/* Metadata */}
        <Divider />
        <Group justify="space-between">
          <div>
            <Text size="xs" c="dimmed">Created</Text>
            <Text size="xs">{new Date(employee.created_at).toLocaleString()}</Text>
          </div>
          {employee.updated_at && (
            <div>
              <Text size="xs" c="dimmed">Last Updated</Text>
              <Text size="xs">{new Date(employee.updated_at).toLocaleString()}</Text>
            </div>
          )}
        </Group>
      </Stack>
    </Modal>
  );
}
