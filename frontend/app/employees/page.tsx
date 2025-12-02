'use client';

import { useState } from 'react';
import { Container, Title, Paper, Table, Button, Group, Text, Badge } from '@mantine/core';
import { IconPlus, IconDownload } from '@tabler/icons-react';
import useSWR from 'swr';
import { fetcher, employeeApi } from '@/lib/api';
import { Employee, TaxDeductionProfile } from '@/types';
import AddEmployeeModal from '@/components/AddEmployeeModal';
import ViewEmployeeModal from '@/components/ViewEmployeeModal';
import EditEmployeeModal from '@/components/EditEmployeeModal';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import { exportToCSV } from '@/lib/utils';
import { notifications } from '@mantine/notifications';

export default function EmployeesPage() {
  const [modalOpened, setModalOpened] = useState(false);
  const [viewModalOpened, setViewModalOpened] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { data: employees, error, isLoading, mutate } = useSWR<Employee[]>('/employees/', fetcher);
  const { data: taxProfiles } = useSWR<TaxDeductionProfile[]>('/taxes-deductions/', fetcher);

  const taxProfileOptions = taxProfiles?.map(profile => ({
    value: profile.profile_id.toString(),
    label: profile.profile_name,
  })) || [];

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setViewModalOpened(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEditModalOpened(true);
  };

  const handleDeleteClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDeleteModalOpened(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEmployee) return;
    
    setDeleteLoading(true);
    try {
      await employeeApi.delete(selectedEmployee.employee_id);
      notifications.show({
        title: 'Success',
        message: 'Employee deleted successfully',
        color: 'green',
      });
      mutate();
      setDeleteModalOpened(false);
      setSelectedEmployee(null);
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to delete employee',
        color: 'red',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDownload = () => {
    if (!employees || employees.length === 0) {
      alert('No employees to export');
      return;
    }
    
    const exportData = employees.map(emp => ({
      'Employee ID': emp.employee_id,
      'First Name': emp.first_name,
      'Last Name': emp.last_name,
      'Email': emp.email,
      'Phone': emp.phone || '',
      'Role': emp.role,
      'Status': emp.status,
      'Pay Type': emp.pay_type,
      'Hourly Rate (₦)': emp.hourly_rate || '',
      'Annual Salary (₦)': emp.salary_amount || '',
      'Start Date': new Date(emp.start_date).toLocaleDateString(),
    }));
    
    exportToCSV(exportData, `employees_${new Date().toISOString().split('T')[0]}`);
  };

  if (error) {
    return (
      <Container size="xl" py="xl">
        <Text c="red">Failed to load employees</Text>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={1}>Employees</Title>
        <Group>
          <Button 
            leftSection={<IconDownload size={16} />}
            variant="light"
            onClick={handleDownload}
          >
            Download CSV
          </Button>
          <Button 
            leftSection={<IconPlus size={16} />}
            onClick={() => setModalOpened(true)}
          >
            Add Employee
          </Button>
        </Group>
      </Group>

      <AddEmployeeModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        onSuccess={() => mutate()}
        taxProfiles={taxProfileOptions}
      />

      <ViewEmployeeModal
        opened={viewModalOpened}
        onClose={() => {
          setViewModalOpened(false);
          setSelectedEmployee(null);
        }}
        employee={selectedEmployee}
      />

      <EditEmployeeModal
        opened={editModalOpened}
        onClose={() => {
          setEditModalOpened(false);
          setSelectedEmployee(null);
        }}
        onSuccess={() => mutate()}
        employee={selectedEmployee}
        taxProfiles={taxProfileOptions}
      />

      <ConfirmDeleteModal
        opened={deleteModalOpened}
        onClose={() => {
          setDeleteModalOpened(false);
          setSelectedEmployee(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Employee"
        message={`Are you sure you want to delete ${selectedEmployee?.first_name} ${selectedEmployee?.last_name}? This action cannot be undone.`}
        loading={deleteLoading}
      />

      <Paper shadow="xs" p="md">
        {isLoading ? (
          <Text>Loading...</Text>
        ) : employees && employees.length > 0 ? (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th>Pay Type</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {employees.map((employee) => (
                <Table.Tr key={employee.employee_id}>
                  <Table.Td>{employee.first_name} {employee.last_name}</Table.Td>
                  <Table.Td>{employee.email}</Table.Td>
                  <Table.Td>{employee.role}</Table.Td>
                  <Table.Td>
                    <Badge color={employee.pay_type === 'hourly' ? 'blue' : 'green'}>
                      {employee.pay_type === 'hourly' ? 'Hourly' : 'Salary'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={employee.status === 'active' ? 'green' : 'gray'}>
                      {employee.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Button 
                        size="xs" 
                        variant="light"
                        onClick={() => handleViewEmployee(employee)}
                      >
                        View
                      </Button>
                      <Button 
                        size="xs" 
                        variant="light"
                        color="blue"
                        onClick={() => handleEditEmployee(employee)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="xs" 
                        variant="light"
                        color="red"
                        onClick={() => handleDeleteClick(employee)}
                      >
                        Delete
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          <Text c="dimmed" ta="center" py="xl">
            No employees found. Click "Add Employee" to get started.
          </Text>
        )}
      </Paper>
    </Container>
  );
}
