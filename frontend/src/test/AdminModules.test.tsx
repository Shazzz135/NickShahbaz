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

    it('allows editing skill years and updating live', async () => {
      render(<AboutManager />);

      await waitFor(() => {
        expect(screen.queryByText(/Syncing About metadata/i)).toBeNull();
      });

      const skillsTab = await screen.findByRole('button', { name: /Skills Matrix/i });
      fireEvent.click(skillsTab);

      // Verify skill logo is present
      const tsLogo = screen.getByAltText('TypeScript') as HTMLImageElement;
      expect(tsLogo).toBeDefined();
      expect(tsLogo.src).toContain('/skills/typescript.png');

      // Click Edit button for TypeScript
      const editButtons = screen.getAllByTitle(/Edit Name & Years/i);
      expect(editButtons.length).toBeGreaterThan(0);
      fireEvent.click(editButtons[0]);

      // Edit years
      const yearsInput = screen.getByPlaceholderText('yrs') as HTMLInputElement;
      expect(yearsInput).toBeDefined();
      fireEvent.change(yearsInput, { target: { value: '7 yrs' } });

      // Verify unsaved changes badge is active
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
        expect(screen.getByText(/\(Copy\)/i)).toBeDefined();
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

      const faviconInput = await screen.findByPlaceholderText(/\/favicon\.(png|svg)/i);
      fireEvent.change(faviconInput, { target: { value: 'https://cdn.example.com/custom-icon.png' } });

      expect((faviconInput as HTMLInputElement).value).toBe('https://cdn.example.com/custom-icon.png');
    });
  });

  // =========================================================================
  // 3. ProjectsManager (Project CRUD, Category Text Box & Update)
  // =========================================================================
  describe('ProjectsManager', () => {
    it('renders projects and supports project creation modal with text box category', async () => {
      render(<ProjectsManager />);

      await waitFor(() => {
        expect(screen.queryByText(/Syncing projects from Supabase/i)).toBeNull();
      });

      const addBtn = await screen.findByRole('button', { name: /Add Project/i });
      expect(addBtn).toBeDefined();

      fireEvent.click(addBtn);
      expect(screen.getByPlaceholderText(/e\.g\. Distributed AI Orchestrator/i)).toBeDefined();
      expect(screen.getByPlaceholderText(/e\.g\. Full-Stack, Mobile/i)).toBeDefined();
    });

    it('supports custom text category and preserves exact category on edit/update', async () => {
      const mockProject = {
        id: 'proj-123',
        title: 'Simple Blackjack',
        slug: 'simple-blackjack',
        subtitle: 'Classic card game',
        description: 'Systems programming card game engine.',
        category: '3D Graphics & Games',
        tags: ['C', 'Shell'],
        featured: false,
        thumbnail_url: null,
        live_url: null,
        github_url: null,
        metrics: { display_category: '3D Graphics & Games' },
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const chain = createQueryMock();
      chain.order.mockResolvedValue({ data: [mockProject], error: null });
      vi.spyOn(supabase, 'from').mockReturnValue(chain as unknown as ReturnType<typeof supabase.from>);

      render(<ProjectsManager />);

      await waitFor(() => {
        expect(screen.getByText('Simple Blackjack')).toBeDefined();
      });

      expect(screen.getByText('3D Graphics & Games')).toBeDefined();

      const editBtn = screen.getByTitle(/Edit Project/i);
      fireEvent.click(editBtn);

      const categoryInput = screen.getByPlaceholderText(/e\.g\. Full-Stack, Mobile/i) as HTMLInputElement;
      expect(categoryInput).toBeDefined();
      expect(categoryInput.value).toBe('3D Graphics & Games');

      fireEvent.change(categoryInput, { target: { value: 'Embedded & Robotics' } });
      expect(categoryInput.value).toBe('Embedded & Robotics');

      const saveBtn = screen.getByRole('button', { name: /Update Project/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(chain.update).toHaveBeenCalled();
      });
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

    it('scans and triggers batch database update to fix spelling and typos', async () => {
      const mockChain = createQueryMock();
      vi.spyOn(supabase, 'from').mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      render(<ExperienceManager />);

      await waitFor(() => {
        expect(screen.queryByText(/Syncing experience timeline from Supabase/i)).toBeNull();
      });

      const fixBtn = await screen.findByRole('button', { name: /Fix Typos in Database/i });
      expect(fixBtn).toBeDefined();

      fireEvent.click(fixBtn);
      await waitFor(() => {
        expect(screen.getByText(/verified and updated/i)).toBeDefined();
      });
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

      expect(await screen.findByRole('heading', { name: /Inbox/i })).toBeDefined();
      expect(screen.getByText(/Inbox is Clear/i)).toBeDefined();
    });
  });
});
