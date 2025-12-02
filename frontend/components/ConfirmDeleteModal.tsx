'use client';

import { Modal, Text, Group, Button } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

interface ConfirmDeleteModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  loading?: boolean;
}

export default function ConfirmDeleteModal({
  opened,
  onClose,
  onConfirm,
  title,
  message,
  loading = false,
}: ConfirmDeleteModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconAlertTriangle size={24} color="red" />
          <Text fw={600}>{title}</Text>
        </Group>
      }
      centered
      size="md"
    >
      <Text mb="lg">{message}</Text>
      <Group justify="flex-end">
        <Button variant="default" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button color="red" onClick={onConfirm} loading={loading}>
          Delete
        </Button>
      </Group>
    </Modal>
  );
}
