<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import VendorForm from './VendorForm.svelte';

  export let event = {};
  const dispatch = createEventDispatcher();

  // Form data
  let title = "";
  let location = "";
  let startDate = "";
  let endDate = "";
  let startTime = "";
  let endTime = "";
  let tagline = "";
  let eventType = "free";
  let pricingTiers = [];
  let currentPricingTier = { name: "", price: "" };
  let expectedAttendees = "";
  let socialMediaUrl = "";
  let videoUrl = "";
  let eventBriefFile = null;
  let eventBriefUrl = "";
  let imagePreview = null;
  let imageFile = null;
  let layoutImagePreview = null;
  let layoutImageFile = null;
  let termsAgreed = false;
  let showVendorForm = false;
  
  // Tab management
  let activeMainTab = "festive";
  let activeFestiveTab = "details";
  let showActionButtons = true;
  let showDeleteConfirm = false;
  let selectedAction = '';
  let confirmInput = '';

  onMount(() => {
    title = event.title || "";
    location = event.location || "";
    startDate = event.startDate || "";
    endDate = event.endDate || "";
    startTime = event.startTime || "";
    endTime = event.endTime || "";
    tagline = event.tagline || "";
    eventType = event.eventType || "free";
    pricingTiers = event.pricingTiers || [];
    expectedAttendees = event.expectedAttendees || "";
    socialMediaUrl = event.socialMediaUrl || "";
    videoUrl = event.videoUrl || "";
    eventBriefUrl = event.eventBriefUrl || "";
    imagePreview = event.imagePreview || null;
    layoutImagePreview = event.layoutImagePreview || null;
    termsAgreed = event.termsAgreed || false;
    activeMainTab = event.type || "festive";
  });

  function handleImageUpload(e, type) {
    const file = e.target.files[0];
    if (file) {
      if (type === 'banner') {
        imageFile = file;
        const reader = new FileReader();
        reader.onload = (event) => {
          imagePreview = event.target.result;
        };
        reader.readAsDataURL(file);
      } else if (type === 'layout') {
        layoutImageFile = file;
        const reader = new FileReader();
        reader.onload = (event) => {
          layoutImagePreview = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    }
  }

  function handleEventBriefUpload(e) {
    const file = e.target.files[0];
    if (file) {
      eventBriefFile = file;
      eventBriefUrl = file.name;
    }
  }

  function addPricingTier() {
    if (currentPricingTier.name && currentPricingTier.price) {
      pricingTiers = [...pricingTiers, currentPricingTier];
      currentPricingTier = { name: "", price: "" };
    }
  }

  function removePricingTier(index) {
    pricingTiers = pricingTiers.filter((_, i) => i !== index);
  }

  function handleActionClick(action) {
    selectedAction = action;
  }

  function handleConfirm() {
    if (selectedAction === 'update') {
      showActionButtons = false;
    } else if (selectedAction === 'delete') {
      showActionButtons = false;
      showDeleteConfirm = true;
    }
  }

  function handleDelete() {
    dispatch('delete', event.id);
    closePopup();
  }

  function saveChanges() {
    if (!termsAgreed) {
      alert("Please agree to the terms and conditions");
      return;
    }
    
    const updatedEvent = {
      ...event,
      title,
      location,
      startDate,
      endDate,
      startTime,
      endTime,
      tagline,
      eventType,
      pricingTiers: eventType === 'paid' ? pricingTiers : [],
      expectedAttendees,
      socialMediaUrl,
      videoUrl,
      eventBriefUrl,
      imagePreview,
      layoutImagePreview,
      type: activeMainTab,
      termsAgreed
    };
    dispatch('save', updatedEvent);
    closePopup();
  }

  function cancelAll() {
    showDeleteConfirm = false;
    showActionButtons = true;
    confirmInput = '';
  }

  function closePopup() {
    dispatch('close');
  }
</script>

<!-- Modal Backdrop -->
<div class="modal-backdrop">
  <!-- Slide-up Modal -->
  <div class="modal-slide-up">
    <button class="close-btn" on:click={closePopup}>✕</button>

    {#if showActionButtons}
      <div class="action-buttons">
        <h2 class="modal-title">Edit Event</h2>
        <div class="grid grid-cols-2 gap-3 mb-4">
          <button class="btn update" on:click={() => handleActionClick('update')}>Update</button>
          <button class="btn delete" on:click={() => handleActionClick('delete')}>Delete</button>
          <button class="btn cancel" on:click={closePopup}>Cancel</button>
          <button class="btn confirm" on:click={handleConfirm}>Confirm</button>
        </div>
      </div>
    {/if}

    <!-- Delete Confirmation -->
    {#if showDeleteConfirm}
      <div class="delete-confirmation">
        <h2 class="modal-title">Delete Event</h2>
        <p class="mb-2 text-sm">Please type <strong>CONFIRM</strong> to delete:</p>
        <input type="text" bind:value={confirmInput} class="input w-full" placeholder="Type CONFIRM to proceed" />
        <div class="button-row mt-3">
          <button class="btn cancel" on:click={cancelAll}>Cancel</button>
          <button class="btn delete" on:click={handleDelete} disabled={confirmInput !== 'CONFIRM'}>Confirm Delete</button>
        </div>
      </div>
    {/if}

    <!-- Edit Form -->
    {#if !showActionButtons && !showDeleteConfirm}
      <div class="edit-form">
        <h2 class="modal-title">Edit Event</h2>
        
        <!-- Main Tab Navigation (Festive/Concert/Conference) -->
        <div class="main-tab-nav">
          <button class:active={activeMainTab === 'festive'} on:click={() => activeMainTab = 'festive'}>
            Festive
          </button>
          <button class:active={activeMainTab === 'concert'} on:click={() => activeMainTab = 'concert'}>
            Concert
          </button>
          <button class:active={activeMainTab === 'conference'} on:click={() => activeMainTab = 'conference'}>
            Conference
          </button>
        </div>

        {#if activeMainTab === 'festive'}
          <!-- Festive Tab Content -->
          <div class="festive-tab-content">
            <!-- Festive Sub-tab Navigation -->
            <div class="sub-tab-nav">
              <button class:active={activeFestiveTab === 'details'} on:click={() => activeFestiveTab = 'details'}>
                Event Details
              </button>
              <button class:active={activeFestiveTab === 'info'} on:click={() => activeFestiveTab = 'info'}>
                Event Info
              </button>
              <button class:active={activeFestiveTab === 'vendors'} on:click={() => activeFestiveTab = 'vendors'}>
                Vendors
              </button>
            </div>

            <!-- Festive Sub-tab Contents -->
            <div class="sub-tab-content">
              {#if activeFestiveTab === 'details'}
                <!-- First Tab: Event Details -->
                <div class="tab-pane">
                  <div class="form-group">
                    <label>Title</label>
                    <input class="input w-full" type="text" bind:value={title} placeholder="Enter event title" />
                  </div>

                  <div class="form-group">
                    <label>Event Banner</label>
                    <div class="relative">
                      <input id="event-image-upload" type="file" accept="image/*" 
                             on:change={(e) => handleImageUpload(e, 'banner')} class="hidden" />
                      <label for="event-image-upload" class="upload-box">
                        {#if imagePreview}
                          <img src={imagePreview} alt="Preview" class="image-preview" />
                        {:else}
                          <span>+</span>
                        {/if}
                      </label>
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Event Location</label>
                    <input class="input w-full" type="text" bind:value={location} placeholder="Enter Location (Google Maps URL)" />
                  </div>

                  <div class="form-group">
                    <label>Event Tagline</label>
                    <textarea class="input w-full" rows="2" bind:value={tagline} 
                              placeholder="A short, catchy phrase that captures the spirit of the event"></textarea>
                  </div>

                  <div class="form-group grid grid-cols-2 gap-4">
                    <div>
                      <label>Start Date</label>
                      <input class="input w-full" type="date" bind:value={startDate} />
                    </div>
                    <div>
                      <label>Start Time</label>
                      <input class="input w-full" type="time" bind:value={startTime} />
                    </div>
                  </div>

                  <div class="form-group grid grid-cols-2 gap-4">
                    <div>
                      <label>End Date</label>
                      <input class="input w-full" type="date" bind:value={endDate} />
                    </div>
                    <div>
                      <label>End Time</label>
                      <input class="input w-full" type="time" bind:value={endTime} />
                    </div>
                  </div>
                </div>

              {:else if activeFestiveTab === 'info'}
                <!-- Second Tab: Event Info -->
                <div class="tab-pane">
                  <div class="form-group">
                    <label>Event Type</label>
                    <div class="flex gap-4 mb-4">
                      <label class="flex items-center">
                        <input type="radio" name="editEventType" value="free" bind:group={eventType} />
                        <span class="ml-2">Free Event</span>
                      </label>
                      <label class="flex items-center">
                        <input type="radio" name="editEventType" value="paid" bind:group={eventType} />
                        <span class="ml-2">Paid Event</span>
                      </label>
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Event Layout Image</label>
                    <div class="relative">
                      <input id="layout-image-upload" type="file" accept="image/*" 
                             on:change={(e) => handleImageUpload(e, 'layout')} class="hidden" />
                      <label for="layout-image-upload" class="upload-box">
                        {#if layoutImagePreview}
                          <img src={layoutImagePreview} alt="Layout Preview" class="image-preview" />
                        {:else}
                          <span>+</span>
                        {/if}
                      </label>
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Expected Attendees / Maximum Capacity</label>
                    <input class="input w-full" type="number" bind:value={expectedAttendees} placeholder="Enter number" />
                  </div>

                  <div class="form-group">
                    <label>Social Media URL</label>
                    <input class="input w-full" type="url" bind:value={socialMediaUrl} placeholder="Enter social media link" />
                  </div>

                  <div class="form-group">
                    <label>Video URL</label>
                    <input class="input w-full" type="url" bind:value={videoUrl} placeholder="Enter video link" />
                  </div>

                  <div class="form-group">
                    <label>Event Brief PDF</label>
                    <div class="flex items-center justify-between mt-2">
                      <span>{eventBriefUrl || "No file selected"}</span>
                      <button type="button" on:click={() => document.getElementById('briefFileInput').click()} class="bg-blue-500 text-white px-3 py-1 rounded">
                        Upload
                      </button>
                      <input id="briefFileInput" type="file" accept=".pdf" on:change={handleEventBriefUpload} style="display: none;" />
                    </div>
                  </div>
                </div>

              {:else if activeFestiveTab === 'vendors'}
                <!-- Third Tab: Vendors -->
                <div class="tab-pane">
                  {#if showVendorForm}
                    <VendorForm on:close={() => showVendorForm = false} />
                  {:else}
                    <button class="send-button" on:click={() => showVendorForm = true}>Add Vendor</button>
                  {/if}

                  <div class="terms-checkbox">
                    <input type="checkbox" id="editTermsAgreement" bind:checked={termsAgreed} />
                    <label for="editTermsAgreement">
                      I agree that:
                      <ul>
                        <li>City Services may display event details publicly for promotion</li>
                        <li>I have obtained all necessary permissions for included content</li>
                        <li>The information complies with privacy laws (PDPA/GDPR as applicable)</li>
                        <li>I retain copyright but grant display rights</li>
                        <li>Event details may appear in city calendars, apps, and partner platform</li>
                      </ul>
                    </label>
                  </div>
                </div>
              {/if}
            </div>
          </div>

        {:else if activeMainTab === 'concert'}
          <!-- Concert Tab Content (empty for now) -->
          <div class="empty-tab">
            <p>Concert event form will be implemented here</p>
          </div>

        {:else if activeMainTab === 'conference'}
          <!-- Conference Tab Content (empty for now) -->
          <div class="empty-tab">
            <p>Conference event form will be implemented here</p>
          </div>
        {/if}

        <button class="btn save mt-4 w-full" on:click={saveChanges}>Save Changes</button>
      </div>
    {/if}
  </div>
</div>

<style>
  /* Modal Styles */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: white;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }

  .modal-slide-up {
    background: white;
    width: 100%;
    max-height: 90vh;
    border-top-left-radius: 1rem;
    border-top-right-radius: 1rem;
    padding: 24px;
    overflow-y: auto;
    position: relative;
    animation: slideUp 0.3s ease-out;
  }

  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }

  .close-btn {
    position: absolute;
    top: 12px;
    right: 16px;
    background: transparent;
    font-size: 20px;
    border: none;
    cursor: pointer;
  }

  .modal-title {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 1rem;
    color: #1f2937;
  }
  
  /* Main Tab Styles */
  .main-tab-nav {
    display: flex;
    justify-content: center; /* Centers the tabs horizontally */
    border-bottom: 1px solid #ddd;
    margin-bottom: 1rem;
  }

  .main-tab-nav button {
    padding: 0.75rem 1.5rem;
    background: transparent;
    border: none;
    border-bottom: 3px solid transparent;
    cursor: pointer;
    font-weight: 500;
    color: #666;
  }

  .main-tab-nav button.active {
    color: #2563eb;
    border-bottom-color: #2563eb;
  }

  /* Sub Tab Styles */
  .sub-tab-nav {
    display: flex;
    border-bottom: 1px solid #ddd;
    margin-bottom: 1rem;
  }

  .sub-tab-nav button {
    padding: 0.75rem 1.5rem;
    background: transparent;
    border: none;
    border-bottom: 3px solid transparent;
    cursor: pointer;
    font-weight: 500;
    color: #666;
  }

  .sub-tab-nav button.active {
    color: #2563eb;
    border-bottom-color: #2563eb;
  }

  .sub-tab-content {
    min-height: 400px;
  }

  .tab-pane {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .empty-tab {
    padding: 2rem;
    text-align: center;
    color: #666;
  }

  /* Form Elements */
  .form-group {
    margin-bottom: 1rem;
  }

  .input {
    padding: 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid #d1d5db;
    width: 100%;
    font-size: 0.875rem;
  }

  .input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px #3b82f6;
  }

  textarea.input {
    min-height: 100px;
  }

  .upload-box {
    width: 100%;
    height: 150px;
    background-color: #f3f4f6;
    border: 2px dashed #ccc;
    border-radius: 12px;
    margin-bottom: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    overflow: hidden;
  }

  .upload-box img {
    max-width: 100%;
    max-height: 100%;
    object-fit: cover;
  }

  .upload-box span {
    font-size: 2rem;
    color: #999;
  }

  .image-preview {
    margin-top: 10px;
    border-radius: 10px;
    max-width: 100%;
    max-height: 200px;
    object-fit: contain;
  }

  /* Terms Checkbox */
  .terms-checkbox {
    margin: 1rem 0;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    font-size: 0.875rem;
  }
  
  .terms-checkbox input {
    margin-right: 0.5rem;
  }
  
  .terms-checkbox label {
    cursor: pointer;
  }

  .terms-checkbox ul {
    margin-top: 0.5rem;
    padding-left: 1.5rem;
    list-style-type: disc;
  }

  .terms-checkbox li {
    margin-bottom: 0.25rem;
  }

  /* Buttons */
  .btn {
    padding: 0.75rem;
    font-weight: 600;
    border-radius: 0.5rem;
    width: 100%;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .btn.update {
    background: #e5e7eb;
    color: #111827;
  }

  .btn.delete {
    background: #ef4444;
    color: white;
  }

  .btn.cancel {
    background: white;
    color: #2563eb;
    border: 2px solid #2563eb;
  }

  .btn.confirm,
  .btn.save {
    background: #2563eb;
    color: white;
  }

  .btn:hover {
    opacity: 0.9;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .send-button {
    background-color: #2563eb;
    color: white;
    padding: 0.75rem;
    border-radius: 0.5rem;
    width: 100%;
    margin-top: 1rem;
    border: none;
    cursor: pointer;
    font-weight: 600;
  }

  .send-button:hover {
    background-color: #1d4ed8;
  }

  /* Grid Utilities */
  .grid {
    display: grid;
  }

  .grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .gap-4 {
    gap: 1rem;
  }

  /* Flex utilities */
  .flex {
    display: flex;
  }

  .items-center {
    align-items: center;
  }

  .justify-between {
    justify-content: space-between;
  }

  .gap-2 {
    gap: 0.5rem;
  }

  .gap-3 {
    gap: 0.75rem;
  }

  /* Spacing */
  .mb-4 {
    margin-bottom: 1rem;
  }

  .mt-4 {
    margin-top: 1rem;
  }

  .w-full {
    width: 100%;
  }
</style>