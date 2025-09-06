import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Contact from '../Contact'

// Helper function to render Contact component with required providers
const renderContact = () => {
  return render(
    <HelmetProvider>
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    </HelmetProvider>
  )
}

describe('Contact Page', () => {
  const validFormData = {
    name: 'John Doe',
    email: 'john@example.com',
    linkedin: 'https://linkedin.com/in/johndoe',
    company: 'Test Company',
    problem: 'I need help with my product strategy and want to compress our idea-to-product cycle.',
    timeline: '1 month',
    budget: '$5k - $25k'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Form Rendering', () => {
    it('renders all required form fields', () => {
      renderContact()
      
      // Check all form fields are present
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/linkedin/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/company/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/problem/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/timeline/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/budget range/i)).toBeInTheDocument()
      
      // Check submit button
      expect(screen.getByRole('button', { name: /send inquiry/i })).toBeInTheDocument()
    })

    it('shows required field indicators', () => {
      renderContact()
      
      // Check specific required field labels contain asterisk
      expect(screen.getByText('Name *')).toBeInTheDocument()
      expect(screen.getByText('Email *')).toBeInTheDocument()
      expect(screen.getByText('LinkedIn *')).toBeInTheDocument()
      expect(screen.getByText('Problem *')).toBeInTheDocument()
      expect(screen.getByText('Timeline *')).toBeInTheDocument()
      expect(screen.getByText('Budget Range *')).toBeInTheDocument()
    })

    it('shows company field as optional', () => {
      renderContact()
      
      expect(screen.getByText('Company')).toBeInTheDocument()
      expect(screen.getByText('(optional)')).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('prevents submission with empty required fields', async () => {
      const user = userEvent.setup()
      renderContact()
      
      const submitButton = screen.getByRole('button', { name: /send inquiry/i })
      await user.click(submitButton)
      
      // Form should not submit without required fields
      expect(screen.queryByText(/thanks!/i)).not.toBeInTheDocument()
    })

    it('validates email format', async () => {
      const user = userEvent.setup()
      renderContact()
      
      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'invalid-email')
      
      // HTML5 validation should catch this
      expect(emailInput).toBeInvalid()
    })

    it('validates LinkedIn URL format', async () => {
      const user = userEvent.setup()
      renderContact()
      
      const linkedinInput = screen.getByLabelText(/linkedin/i)
      await user.type(linkedinInput, 'not-a-url')
      
      // HTML5 validation should catch this
      expect(linkedinInput).toBeInvalid()
    })
  })

  describe('Form Submission', () => {

    it('submits form with valid data', async () => {
      const user = userEvent.setup()
      renderContact()
      
      // Fill out the form
      await user.type(screen.getByLabelText(/name/i), validFormData.name)
      await user.type(screen.getByLabelText(/email/i), validFormData.email)
      await user.type(screen.getByLabelText(/linkedin/i), validFormData.linkedin)
      await user.type(screen.getByLabelText(/company/i), validFormData.company)
      await user.type(screen.getByLabelText(/problem/i), validFormData.problem)
      await user.selectOptions(screen.getByLabelText(/timeline/i), validFormData.timeline)
      await user.selectOptions(screen.getByLabelText(/budget range/i), validFormData.budget)
      
      // Submit the form
      const submitButton = screen.getByRole('button', { name: /send inquiry/i })
      await user.click(submitButton)
      
      // Should show success message
      await waitFor(() => {
        expect(screen.getByText(/thanks!/i)).toBeInTheDocument()
      })
      
      // Should show 24 hour response message
      expect(screen.getByText(/24 hours/i)).toBeInTheDocument()
    })

    it('shows loading state during submission', async () => {
      // Mock a slow submission to catch loading state
      const { addInquiry } = await import('../../lib/supabase')
      vi.mocked(addInquiry).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true, data: {} }), 100))
      )
      
      const user = userEvent.setup()
      renderContact()
      
      // Fill required fields
      await user.type(screen.getByLabelText(/name/i), validFormData.name)
      await user.type(screen.getByLabelText(/email/i), validFormData.email)
      await user.type(screen.getByLabelText(/linkedin/i), validFormData.linkedin)
      await user.type(screen.getByLabelText(/problem/i), validFormData.problem)
      await user.selectOptions(screen.getByLabelText(/timeline/i), validFormData.timeline)
      await user.selectOptions(screen.getByLabelText(/budget range/i), validFormData.budget)
      
      const submitButton = screen.getByRole('button', { name: /send inquiry/i })
      
      // Start submission but don't wait
      user.click(submitButton)
      
      // Should show loading state immediately
      await waitFor(() => {
        expect(screen.getByText(/sending.../i)).toBeInTheDocument()
      })
      expect(submitButton).toBeDisabled()
    })

    it('clears form after successful submission', async () => {
      const user = userEvent.setup()
      renderContact()
      
      // Fill and submit form
      await user.type(screen.getByLabelText(/name/i), validFormData.name)
      await user.type(screen.getByLabelText(/email/i), validFormData.email)
      await user.type(screen.getByLabelText(/linkedin/i), validFormData.linkedin)
      await user.type(screen.getByLabelText(/problem/i), validFormData.problem)
      await user.selectOptions(screen.getByLabelText(/timeline/i), validFormData.timeline)
      await user.selectOptions(screen.getByLabelText(/budget range/i), validFormData.budget)
      
      await user.click(screen.getByRole('button', { name: /send inquiry/i }))
      
      // Wait for success and then reset
      await waitFor(() => {
        expect(screen.getByText(/thanks!/i)).toBeInTheDocument()
      })
      
      // Click to submit another inquiry
      await user.click(screen.getByText(/submit another inquiry/i))
      
      // Form should be cleared
      expect(screen.getByLabelText(/name/i)).toHaveValue('')
      expect(screen.getByLabelText(/email/i)).toHaveValue('')
    })
  })

  describe('Error Handling', () => {
    it('shows error message on submission failure', async () => {
      // Mock a failed submission
      const { addInquiry } = await import('../../lib/supabase')
      vi.mocked(addInquiry).mockResolvedValueOnce({ success: false, error: 'Network error' })
      
      const user = userEvent.setup()
      renderContact()
      
      // Fill and submit form
      await user.type(screen.getByLabelText(/name/i), validFormData.name)
      await user.type(screen.getByLabelText(/email/i), validFormData.email)
      await user.type(screen.getByLabelText(/linkedin/i), validFormData.linkedin)
      await user.type(screen.getByLabelText(/problem/i), validFormData.problem)
      await user.selectOptions(screen.getByLabelText(/timeline/i), validFormData.timeline)
      await user.selectOptions(screen.getByLabelText(/budget range/i), validFormData.budget)
      
      await user.click(screen.getByRole('button', { name: /send inquiry/i }))
      
      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
        // Check specifically for the error message email, not the footer one
        expect(screen.getByText(/please try again or email me directly/i)).toBeInTheDocument()
      })
    })
  })

  describe('Analytics Tracking', () => {
    it('tracks form submission event', async () => {
      const { trackFormSubmit } = await import('../../lib/analytics')
      const user = userEvent.setup()
      renderContact()
      
      // Fill and submit form (include company for has_company: true)
      await user.type(screen.getByLabelText(/name/i), validFormData.name)
      await user.type(screen.getByLabelText(/email/i), validFormData.email)
      await user.type(screen.getByLabelText(/linkedin/i), validFormData.linkedin)
      await user.type(screen.getByLabelText(/company/i), validFormData.company)
      await user.type(screen.getByLabelText(/problem/i), validFormData.problem)
      await user.selectOptions(screen.getByLabelText(/timeline/i), validFormData.timeline)
      await user.selectOptions(screen.getByLabelText(/budget range/i), validFormData.budget)
      
      await user.click(screen.getByRole('button', { name: /send inquiry/i }))
      
      // Should track the form submission
      await waitFor(() => {
        expect(trackFormSubmit).toHaveBeenCalledWith('contact_inquiry', {
          budget_range: validFormData.budget,
          timeline: validFormData.timeline,
          has_company: true
        })
      })
    })
  })
})
