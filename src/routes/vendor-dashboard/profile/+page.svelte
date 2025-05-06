<script>
    let isEditing = false;
    let showProfile = false;
  
    // Personal Information
    let fullName = "Huat Ong Heng";
    let mobileNumber = "+601101018888";
    let email = "Huatongheng@gmail.com";
    let gender = "Male";
    let dob = {
      day: "10",
      month: "January",
      year: "1985"
    };
  
    // Vendor Information
    let businessName = "Huat Ong Heng Enterprise";
    let contactEmail = "xxxxx@gmail.com";
    let phoneNumber = "+6012345678";
    let businessDescription = "------------------------------\n---------------------------------\n----------------------------------";
    let facebookURL = "https://facebook.com";
    let instagramURL = "https://instagram.com";
  
    const handleEdit = () => {
      isEditing = !isEditing;
    };
  
    const handleShowProfile = () => {
      showProfile = !showProfile;
    };
  </script>
  
  <div class="p-6 max-w-3xl mx-auto bg-white rounded-xl shadow-md space-y-6">
    <!-- Top Navigation -->
    <div class="flex justify-between items-center">
      <button on:click={() => history.back()} class="text-blue-600 hover:underline">
        ← My Profile Settings
      </button>
      <button on:click={handleEdit} class="text-blue-600 hover:underline">
        ✏️ {isEditing ? "Save" : "Edit"}
      </button>
    </div>
  
    <!-- Profile Picture -->
    <div class="flex justify-center">
      <img src="https://via.placeholder.com/120" alt="Profile" class="w-28 h-28 rounded-full border-2 border-gray-300" />
    </div>
  
    <!-- Personal Details -->
    <div class="space-y-4">
      <div>
        <label for="fullName" class="font-semibold">👨🏻‍💼 Full Name</label>
        <input id="fullName" class="w-full border px-4 py-2 rounded mt-1" bind:value={fullName} disabled={!isEditing} />
      </div>
  
      <div>
        <label for="mobileNumber" class="font-semibold">📞 Mobile Number</label>
        <input id="mobileNumber" class="w-full border px-4 py-2 rounded mt-1" bind:value={mobileNumber} disabled={!isEditing} />
      </div>
  
      <div>
        <label for="email" class="font-semibold">📧 Email</label>
        <input id="email" class="w-full border px-4 py-2 rounded mt-1" bind:value={email} disabled={!isEditing} />
      </div>
  
      <div>
        <label for="gender-female" class="font-semibold">⚥ Gender</label>
        <div class="flex gap-4 mt-1">
          <button id="gender-female" class="px-4 py-2 rounded border" class:selected={gender === "Female"} on:click={() => gender = "Female"} disabled={!isEditing}>Female</button>
          <button id="gender-male" class="px-4 py-2 rounded border" class:selected={gender === "Male"} on:click={() => gender = "Male"} disabled={!isEditing}>Male</button>
        </div>
      </div>
  
      <div>
        <label for="dob-day" class="font-semibold">🗓️ Date of Birth</label>
        <div class="flex gap-4 mt-1">
          <select id="dob-day" bind:value={dob.day} disabled={!isEditing} class="border px-2 py-1 rounded">
            {#each Array(31) as _, i}
              <option>{i + 1}</option>
            {/each}
          </select>
          <select id="dob-month" bind:value={dob.month} disabled={!isEditing} class="border px-2 py-1 rounded">
            {#each ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] as month}
              <option>{month}</option>
            {/each}
          </select>
          <select id="dob-year" bind:value={dob.year} disabled={!isEditing} class="border px-2 py-1 rounded">
            {#each Array(60) as _, i}
              <option>{2025 - i}</option>
            {/each}
          </select>
        </div>
      </div>
    </div>
  
    <!-- Vendor Profile Section (Editable under Edit) -->
    <hr class="my-4" />
    <h2 class="text-xl font-bold">Vendor Profile</h2>
  
    <!-- Vendor Profile Button (Trigger Pop-out) -->
    <div>
      <button on:click={handleShowProfile} class="text-blue-600 hover:underline">
        {showProfile ? "Hide Vendor Profile" : "Show Vendor Profile"}
      </button>
    </div>
  
    <!-- Vendor Profile Pop-out Section -->
    {#if showProfile}
      <div class="space-y-4 transition-all duration-500 ease-in-out transform scale-100" style="transition: opacity 0.5s ease; opacity: 1;">
        <div>
          <label for="businessName" class="font-semibold">🏢 Business Name</label>
          <input id="businessName" class="w-full border px-4 py-2 rounded mt-1" bind:value={businessName} disabled={!isEditing} />
        </div>
  
        <div>
          <label for="contactEmail" class="font-semibold">📧 Contact E-mail</label>
          <input id="contactEmail" class="w-full border px-4 py-2 rounded mt-1" bind:value={contactEmail} disabled={!isEditing} />
        </div>
  
        <div>
          <label for="phoneNumber" class="font-semibold">📞 Phone Number</label>
          <input id="phoneNumber" class="w-full border px-4 py-2 rounded mt-1" bind:value={phoneNumber} disabled={!isEditing} />
        </div>
  
        <div>
          <label for="businessDescription" class="font-semibold">📝 Business Description</label>
          <textarea id="businessDescription" class="w-full border px-4 py-2 rounded mt-1" rows="4" bind:value={businessDescription} disabled={!isEditing}></textarea>
        </div>
  
        <!-- Social Media Links -->
        <div>
          <label for="socialMediaLinks" class="font-semibold">📱 Social Media Links</label>
          <div id="socialMediaLinks" class="space-y-2 mt-1">
            <div>
              <label for="facebookURL">Facebook</label>
              <input id="facebookURL" class="w-full border px-4 py-2 rounded mt-1" bind:value={facebookURL} disabled={!isEditing} />
            </div>
            <div>
              <label for="instagramURL">Instagram</label>
              <input id="instagramURL" class="w-full border px-4 py-2 rounded mt-1" bind:value={instagramURL} disabled={!isEditing} />
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
  
  <style>
    button[class~="selected"] {
      background-color: #2563eb; /* blue-600 */
      color: white;
    }
  
    .transition-all {
      transition: transform 0.5s ease, opacity 0.5s ease;
    }
  
    .scale-100 {
      transform: scale(1);
    }
  </style>
  