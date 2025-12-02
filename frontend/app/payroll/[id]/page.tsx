'use client';

import { Container, Title, Paper, Group, Text, Button, Grid, Divider, Box, Badge, Stack } from '@mantine/core';
import { IconPrinter, IconArrowLeft } from '@tabler/icons-react';
import useSWR from 'swr';
import { fetcher, payRunApi, employeeApi } from '@/lib/api';
import { PayRun, Employee } from '@/types';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { formatNaira } from '@/lib/utils';

export default function PayRunDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: payRun, error: payRunError, isLoading: payRunLoading } = useSWR<PayRun>(`/pay-runs/${params.id}`, fetcher);
  
  // Fetch employee details separately to get name, etc.
  const { data: employee } = useSWR<Employee>(
    payRun ? `/employees/${payRun.employee_id}` : null,
    fetcher
  );

  const handlePrint = () => {
    window.print();
  };

  if (payRunLoading) {
    return <Container size="md" py="xl"><Text>Loading pay run details...</Text></Container>;
  }

  if (payRunError || !payRun) {
    return (
      <Container size="md" py="xl">
        <Text c="red">Failed to load pay run details.</Text>
        <Button mt="md" onClick={() => router.back()}>Go Back</Button>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      {/* Navigation and Actions - Hidden when printing */}
      <Group justify="space-between" mb="xl" className="print-hidden">
        <Button variant="subtle" leftSection={<IconArrowLeft size={16} />} onClick={() => router.back()}>
          Back to Pay Runs
        </Button>
        <Button leftSection={<IconPrinter size={16} />} onClick={handlePrint}>
          Print / Save PDF
        </Button>
      </Group>

      {/* Pay Slip Content */}
      <Paper p="xl" shadow="sm" withBorder className="print-content">
        {/* Header */}
        <Group justify="space-between" align="flex-start" mb="xl">
          <Box>
            <Title order={2} mb="xs">PAY SLIP</Title>
            <Text c="dimmed" size="sm">MDatabase Payroll System</Text>
            <Text c="dimmed" size="sm">123 Business Rd, Tech City</Text>
          </Box>
          <Box style={{ textAlign: 'right' }}>
            <Text fw={700} size="lg">Pay Date: {payRun.pay_date ? new Date(payRun.pay_date).toLocaleDateString() : 'Pending'}</Text>
            <Text size="sm">Period: {new Date(payRun.start_period).toLocaleDateString()} - {new Date(payRun.end_period).toLocaleDateString()}</Text>
            <Badge 
              size="lg" 
              mt="xs"
              color={
                payRun.payment_status === 'paid' ? 'green' : 
                payRun.payment_status === 'pending' ? 'yellow' : 'red'
              }
            >
              {payRun.payment_status.toUpperCase()}
            </Badge>
          </Box>
        </Group>

        <Divider my="xl" />

        {/* Employee Info */}
        <Grid mb="xl">
          <Grid.Col span={6}>
            <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Employee</Text>
            <Text size="lg" fw={500}>{employee ? `${employee.first_name} ${employee.last_name}` : `Employee #${payRun.employee_id}`}</Text>
            <Text size="sm">{employee?.role}</Text>
            <Text size="sm">{employee?.email}</Text>
          </Grid.Col>
          <Grid.Col span={6} style={{ textAlign: 'right' }}>
            <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Pay Run ID</Text>
            <Text>#{payRun.pay_run_id}</Text>
          </Grid.Col>
        </Grid>

        {/* Earnings Section */}
        <Box mb="xl">
          <Text fw={700} size="md" mb="md" tt="uppercase" c="blue">Earnings</Text>
          <TableWrapper>
            <tbody>
              <TableRow label="Regular Pay" amount={payRun.regular_pay} hours={payRun.regular_hours} />
              <TableRow label="Overtime Pay" amount={payRun.overtime_pay} hours={payRun.overtime_hours} />
              <TableRow label="Bonuses" amount={payRun.bonuses} />
              <TableRow label="Gross Pay" amount={payRun.gross_pay} isTotal />
            </tbody>
          </TableWrapper>
        </Box>

        <Grid>
          {/* Taxes Section */}
          <Grid.Col span={6}>
            <Box mb="xl">
              <Text fw={700} size="md" mb="md" tt="uppercase" c="red">Taxes</Text>
              <TableWrapper>
                <tbody>
                  <TableRow label="Federal Tax" amount={payRun.federal_tax} />
                  <TableRow label="State Tax" amount={payRun.state_tax} />
                  <TableRow label="Local Tax" amount={payRun.local_tax} />
                  <TableRow label="Social Security" amount={payRun.social_security} />
                  <TableRow label="Medicare" amount={payRun.medicare} />
                  <TableRow label="Total Taxes" amount={payRun.total_taxes} isTotal />
                </tbody>
              </TableWrapper>
            </Box>
          </Grid.Col>

          {/* Deductions Section */}
          <Grid.Col span={6}>
            <Box mb="xl">
              <Text fw={700} size="md" mb="md" tt="uppercase" c="orange">Deductions</Text>
              <TableWrapper>
                <tbody>
                  <TableRow label="Retirement" amount={payRun.retirement} />
                  <TableRow label="Insurance" amount={payRun.insurance} />
                  <TableRow label="Other" amount={payRun.other_deductions} />
                  <TableRow label="Total Deductions" amount={payRun.total_deductions} isTotal />
                </tbody>
              </TableWrapper>
            </Box>
          </Grid.Col>
        </Grid>

        <Divider my="xl" />

        {/* Net Pay */}
        <Group justify="flex-end" align="center">
          <Stack gap={0} align="flex-end">
            <Text size="xl" fw={700}>NET PAY</Text>
            <Text size="xl" fw={700} c="blue" fz={32}>
              {formatNaira(Number(payRun.net_pay))}
            </Text>
          </Stack>
        </Group>

        {/* Footer for Print */}
        <Box className="print-only" mt={50}>
          <Text size="xs" c="dimmed" ta="center">Generated by MDatabase Payroll System on {new Date().toLocaleDateString()}</Text>
        </Box>
      </Paper>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page { margin: 0; size: auto; }
          body { background: white; }
          .print-hidden { display: none !important; }
          .print-content { 
            box-shadow: none !important; 
            border: none !important;
            padding: 20px !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          /* Ensure background colors print */
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </Container>
  );
}

// Helper Components
function TableWrapper({ children }: { children: React.ReactNode }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      {children}
    </table>
  );
}

function TableRow({ label, amount, hours, isTotal = false }: { label: string, amount: number | string, hours?: number | string, isTotal?: boolean }) {
  const numAmount = Number(amount);
  if (!isTotal && numAmount === 0 && !hours) return null; // Hide empty rows

  return (
    <tr style={{ borderTop: isTotal ? '1px solid #eee' : 'none' }}>
      <td style={{ padding: '8px 0', fontWeight: isTotal ? 700 : 400 }}>
        {label} {hours && Number(hours) > 0 && <Text span size="xs" c="dimmed">({Number(hours)} hrs)</Text>}
      </td>
      <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: isTotal ? 700 : 400 }}>
        {formatNaira(numAmount)}
      </td>
    </tr>
  );
}
