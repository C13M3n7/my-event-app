<script>
  import { createEventDispatcher } from 'svelte';
  import VendorForm from './VendorForm.svelte';
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

  function handleImageUpload(event, type) {
    const file = event.target.files[0];
    if (file) {
      if (type === 'banner') {
        imageFile = file;
        const reader = new FileReader();
        reader.onload = e => {
          imagePreview = e.target.result;
        };
        reader.readAsDataURL(file);
      } else if (type === 'layout') {
        layoutImageFile = file;
        const reader = new FileReader();
        reader.onload = e => {
          layoutImagePreview = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    }
  }

  function handleEventBriefUpload(event) {
    const file = event.target.files[0];
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

  function saveEvent() {
    if (!termsAgreed) {
      alert("Please agree to the terms and conditions");
      return;
    }
    const eventData = {
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
    dispatch('save', eventData);
  }
</script>

<div class="form-container">
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
            <label><strong>Title</strong></label>
            <input type="text" bind:value={title} placeholder="Enter event title" />

            <label>Event Banner</label>
            <button class="upload-box" type="button" aria-label="Upload image" on:click={() => document.getElementById('fileInput').click()}>
              {#if imagePreview}
                <img src={imagePreview} alt="Preview" />
              {:else}
                <span>+</span>
              {/if}
              <input id="fileInput" type="file" accept="image/*" style="display:none" 
                     on:change={(e) => handleImageUpload(e, 'banner')} />
            </button>
            
            <label>Event Location</label>
            <input type="text" bind:value={location} placeholder="Enter Location (Google Maps URL)" />

            <label>Event Tagline</label>
            <textarea rows="2" bind:value={tagline} placeholder="A short, catchy phrase that captures the spirit of the event"></textarea>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label>Start Date</label>
                <input type="date" bind:value={startDate} />
              </div>
              <div>
                <label>Start Time</label>
                <input type="time" bind:value={startTime} />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label>End Date</label>
                <input type="date" bind:value={endDate} />
              </div>
              <div>
                <label>End Time</label>
                <input type="time" bind:value={endTime} />
              </div>
            </div>
          </div>

        {:else if activeFestiveTab === 'info'}
          <!-- Second Tab: Event Info -->
          <div class="tab-pane">
            <label>Event Type</label>
            <div class="flex gap-4 mb-4">
              <label class="flex items-center">
                <input type="radio" name="eventType" value="free" bind:group={eventType} />
                <span class="ml-2">Free Event</span>
              </label>
              <label class="flex items-center">
                <input type="radio" name="eventType" value="paid" bind:group={eventType} />
                <span class="ml-2">Paid Event</span>
              </label>
            </div>

            <label>Event Layout Image</label>
            <button class="upload-box" type="button" aria-label="Upload layout image" 
                    on:click={() => document.getElementById('layoutFileInput').click()}>
              {#if layoutImagePreview}
                <img src={layoutImagePreview} alt="Layout Preview" />
              {:else}
                <span>+</span>
              {/if}
              <input id="layoutFileInput" type="file" accept="image/*" style="display:none" 
                     on:change={(e) => handleImageUpload(e, 'layout')} />
            </button>

            <label>Expected Attendees / Maximum Capacity</label>
            <input type="number" bind:value={expectedAttendees} placeholder="Enter number" />

            <label>Social Media URL</label>
            <input type="url" bind:value={socialMediaUrl} placeholder="Enter social media link" />

            <label>Video URL</label>
            <input type="url" bind:value={videoUrl} placeholder="Enter video link" />

            <div class="file-upload-container">
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
              <input type="checkbox" id="termsAgreement" bind:checked={termsAgreed} />
              <label for="termsAgreement">
                I agree that:
                <ul>
                  <li>City Services may display event details in attached project brief publicly for promotion</li>
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

  <!-- Save Button (shown for all main tabs) -->
  <button class="save-button" on:click={saveEvent}>Save</button>
</div>

<style>

  .main-tab-nav {
  display: flex;
  justify-content: space-around; /* Evenly distribute tabs */
  background-color: rgb(2, 74, 174);
  
  margin-bottom: 1rem;
}

.main-tab-nav button {
  flex: 1; /* Equal width */
  padding: 1rem;
  text-align: center;
  color: white;
  background-color: transparent;
  border: none;
  
  font-weight: 600;
}

.main-tab-nav button.active {
  border-bottom: 3px solid white;
  background-color: rgba(255, 255, 255, 0.15);
}
.sub-tab-nav {
  display: flex;
  justify-content: space-around; /* Evenly distribute tabs */
  
  border-bottom: 1px solid #ddd;
  margin-bottom: 1rem;
}

.sub-tab-nav button {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: #666;
  font-weight: 500;
}

.sub-tab-nav button.active {
  color: #2563eb;
  border-bottom: 3px solid #2563eb;
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

  input[type="text"],
  input[type="date"],
  input[type="time"],
  input[type="number"],
  input[type="url"],
  select,
  textarea {
    width: 100%;
    padding: 8px;
    margin-bottom: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
  }

  /* Terms Checkbox */
  .terms-checkbox {
    margin: 1rem 0;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    font-size: 0.9rem;
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
  .send-button,
  .save-button {
    background-color: #2563eb;
    color: white;
    padding: 10px;
    border-radius: 12px;
    width: 100%;
    margin-top: 10px;
    border: none;
    cursor: pointer;
  }

  .send-button:hover,
  .save-button:hover {
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

  /* Flex Utilities */
  .flex {
    display: flex;
  }

  .items-center {
    align-items: center;
  }

  .justify-between {
    justify-content: space-between;
  }

  /* File Upload Container */
  .file-upload-container {
    margin-bottom: 16px;
  }

  .file-upload-container label {
    display: block;
    margin-bottom: 4px;
    font-weight: 500;
  }

  .file-upload-container > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1px solid #ddd;
    padding: 10px 12px;
    border-radius: 8px;
    background-color: #f9fafb;
    font-size: 14px;
  }

  .file-upload-container span {
    color: #555;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 70%;
  }

  .file-upload-container button {
    background-color: #10b981;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
  }
</style>