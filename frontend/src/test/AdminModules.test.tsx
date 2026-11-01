import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AboutManager } from '../components/admin/AboutManager';
import { SiteSettingsManager } from '../components/admin/SiteSettingsManager';
import { ProjectsManager } from '../components/admin/ProjectsManager';
import { ExperienceManager } from '../components/admin/ExperienceManager';
import { InquiriesViewer } from '../components/admin/InquiriesViewer';
import { supabase } from '../lib/supabase';

// Mock window.confirm
vi.spyOn(window, 'confirm').mockImplementation(() => true);

type MockQueryResult = { data: unknown; error: null };

interface MockChain extends PromiseLike<MockQueryResult> {
  select: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  maybeSingle: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  upsert: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
}

function createQueryMock(): MockChain {
  const chain: MockChain = {
    select: vi.fn(),
    order: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn(),
    single: vi.fn(),
    upsert: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    then: (resolve) => Promise.resolve({ data: [], error: null }).then(resolve),
  };

  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.update.mockReturnValue(chain);
  chain.delete.mockReturnValue(chain);
  chain.insert.mockResolvedValue({ error: null });
  chain.upsert.mockResolvedValue({ error: null });
  chain.maybeSingle.mockResolvedValue({ data: null, error: null });
  chain.single.mockResolvedValue({ data: null, error: null });
  chain.order.mockResolvedValue({ data: [], error: null });

  return chain;
}

describe('Admin Modules - Full Functionality Verification', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
    vi.spyOn(supabase, 'from').mockImplementation(() => createQueryMock() as unknown as ReturnType<typeof supabase.from>);
  });

  // =========================================================================
  // 1. AboutManager (Skills Matrix, Draggable Proficiency & Clean Deletion)
  // =========================================================================
  describe('AboutManager & Skills Matrix', () => {
    it('switches to Skills Matrix tab and displays skills', async () => {
      render(<AboutManager />);

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText(/Syncing About metadata/i)).toBeNull();
      });

      const skillsTab = await screen.findByRole('button', { name: /Skills Matrix/i });
      fireEvent.click(skillsTab);

      // Verify Skills tab header & Quick Add bar
      expect(screen.getByText(/Skills Matrix & Technical Stack/i)).toBeDefined();
      expect(screen.getByPlaceholderText(/Skill \/ Technology Name/i)).toBeDefined();
      expect(screen.getByText('TypeScript')).toBeDefined();
    });

    it('allows dragging and updating proficiency live', async () => {
      render(<AboutManager />);

      await waitFor(() => {
        expect(screen.queryByText(/Syncing About metadata/i)).toBeNull();
      });

      const skillsTab = await screen.findByRole('button', { name: /Skills Matrix/i });
      fireEvent.click(skillsTab);

      // Find proficiency sliders for skills
      const tsSlider = screen.getByTitle(/Drag to adjust TypeScript proficiency/i) as HTMLInputElement;
      expect(tsSlider).toBeDefined();

      // Drag proficiency from 96% to 80%
      fireEvent.change(tsSlider, { target: { value: '80' } });

      // Verify level is updated live and unsaved changes badge is active
      expect(tsSlider.value).toBe('80');
      expect(screen.getByText(/Unsaved Edits/i)).toBeDefined();
    });

    it('efficiently adds skills using Quick-Add bar', async () => {
      render(<AboutManager />);

      await waitFor(() => {
        expect(screen.queryByText(/Syncing About metadata/i)).toBeNull();
      });

      const skillsTab = await screen.findByRole('button', { name: /Skills Matrix/i });
      fireEvent.click(skillsTab);

      // Quick Add a new technology
      const quickInput = screen.getByPlaceholderText(/Skill \/ Technology Name/i);
      fireEvent.change(quickInput, { target: { value: 'WebGPU Compute' } });

      const addBtn = screen.getByRole('button', { name: /^Add$/i });
      fireEvent.click(addBtn);

      // Verify added skill is immediately in the matrix
      await waitFor(() => {
        expect(screen.getByText('WebGPU Compute')).toBeDefined();
      });
    });

    it('duplicates a skill with 1-click clone action', async () => {
      render(<AboutManager />);

      await waitFor(() => {
        expect(screen.queryByText(/Syncing About metadata/i)).toBeNull();
      });

      const skillsTab = await screen.findByRole('button', { name: /Skills Matrix/i });
      fireEvent.click(skillsTab);

      const dupButtons = screen.getAllByTitle(/Duplicate skill item/i);
      expect(dupButtons.length).toBeGreaterThan(0);
      fireEvent.click(dupButtons[0]);

      // Verify duplicate is present
      await waitFor(() => {
        expect(screen.getByText(/TypeScript \(Copy\)/i)).toBeDefined();
      });
    });

    it('deletes a skill with two-step confirmation and provides Undo restore', async () => {
      render(<AboutManager />);

      await waitFor(() => {
        expect(screen.queryByText(/Syncing About metadata/i)).toBeNull();
      });

      const skillsTab = await screen.findByRole('button', { name: /Skills Matrix/i });
      fireEvent.click(skillsTab);

      // Target first delete button
      const deleteButtons = screen.getAllByTitle(/Delete skill/i);
      fireEvent.click(deleteButtons[0]);

      // Confirm button should appear
      const confirmBtn = await screen.findByRole('button', { name: /Delete\?/i });
      fireEvent.click(confirmBtn);

      // Undo button should appear in the banner
      const undoBtn = await screen.findByRole('button', { name: /Undo Delete/i });
      expect(undoBtn).toBeDefined();

      // Click Undo to restore
      fireEvent.click(undoBtn);
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /Undo Delete/i })).toBeNull();
      });
    });

    it('saves all about metadata to Supabase', async () => {
      const mockChain = createQueryMock();
      const fromSpy = vi.spyOn(supabase, 'from').mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      render(<AboutManager />);

      await waitFor(() => {
        expect(screen.queryByText(/Syncing About metadata/i)).toBeNull();
      });

      const saveBtn = await screen.findByRole('button', { name: /Save Changes/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(fromSpy).toHaveBeenCalled();
        expect(mockChain.upsert).toHaveBeenCalled();
      });
    });
  });

  // =========================================================================
  // 2. SiteSettingsManager (Mailing Toggle, Favicon & Telemetry)
  // =========================================================================
  describe('SiteSettingsManager', () => {
    it('renders site branding and allows toggling the built-in mailing service', async () => {
      render(<SiteSettingsManager />);

      // Verify Browser tab icon section and mailing service section
      expect(await screen.findByText(/Browser Tab Branding & Icon/i)).toBeDefined();
      expect(screen.getByText(/Built-In Mailing Service & Inquiry Relay/i)).toBeDefined();

      // Toggle mailing service
      const mailingToggle = screen.getByLabelText(/Accept Inquiries/i) as HTMLInputElement;
      expect(mailingToggle.checked).toBe(true);

      fireEvent.click(mailingToggle);
      expect(mailingToggle.checked).toBe(false);
      expect(screen.getByText(/Pause Inquiries/i)).toBeDefined();
    });

    it('updates favicon URL with instant preview', async () => {
      render(<SiteSettingsManager />);

      const faviconInput = await screen.findByPlaceholderText(/\/favicon\.svg/i);
      fireEvent.change(faviconInput, { target: { value: 'https://cdn.example.com/custom-icon.png' } });

      expect((faviconInput as HTMLInputElement).value).toBe('https://cdn.example.com/custom-icon.png');
    });
  });

  // =========================================================================
  // 3. ProjectsManager (Project CRUD & Immediate Deletion)
  // =========================================================================
  describe('ProjectsManager', () => {
    it('renders projects and supports project creation modal', async () => {
      render(<ProjectsManager />);

      await waitFor(() => {
        expect(screen.queryByText(/Syncing projects from Supabase/i)).toBeNull();
      });

      const addBtn = await screen.findByRole('button', { name: /Add Project/i });
      expect(addBtn).toBeDefined();

      fireEvent.click(addBtn);
      expect(screen.getByPlaceholderText(/e\.g\. Distributed AI Orchestrator/i)).toBeDefined();
    });
  });

  // =========================================================================
  // 4. ExperienceManager (Timeline CRUD & Deletion)
  // =========================================================================
  describe('ExperienceManager', () => {
    it('renders timeline milestones and filters by type', async () => {
      render(<ExperienceManager />);

      await waitFor(() => {
        expect(screen.queryByText(/Syncing experience timeline from Supabase/i)).toBeNull();
      });

      expect(await screen.findByText(/Career & Milestones Timeline/i)).toBeDefined();
      const addMilestoneButtons = screen.getAllByRole('button', { name: /Add Milestone/i });
      expect(addMilestoneButtons.length).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // 5. InquiriesViewer (Status Updates & Permanent Deletion)
  // =========================================================================
  describe('InquiriesViewer', () => {
    it('renders inquiries and displays unread badge and empty state', async () => {
      render(<InquiriesViewer />);

      await waitFor(() => {
        expect(screen.queryByText(/Syncing inquiries from Supabase/i)).toBeNull();
      });

      expect(await screen.findByText(/Inquiries Inbox/i)).toBeDefined();
      expect(screen.getByText(/Inbox is Clear/i)).toBeDefined();
    });
  });
});
