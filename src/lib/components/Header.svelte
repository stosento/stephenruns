<script lang="ts">
  import { page } from '$app/stores';
  import { writable } from 'svelte/store';
  
  interface NavLink {
    href: string;
    label: string;
  }

  const navLinks: NavLink[] = [
    { href: '/', label: 'Home' },
    { href: '/#calendar', label: 'Calendar' },
    { href: '/locations', label: 'Routes' },
    { href: '/faq', label: 'FAQ' }
  ];
  
  // Mobile menu state
  const isMobileMenuOpen = writable(false);
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    isMobileMenuOpen.update(value => !value);
  };
</script>

<header class="bg-blue-500 shadow-md">
  <div class="container mx-auto px-4">
    <nav class="flex items-center justify-between h-20">
      <!-- Logo/Brand -->
      <div class="flex items-center">
        <a href="/" class="text-white text-2xl font-bold">
          stephen<span class="text-blue-200">runs</span>
        </a>
      </div>

      <!-- Navigation Links -->
      <div class="hidden md:flex items-center space-x-8">
        {#each navLinks as link}
          <a
            href={link.href}
            class="text-white hover:text-blue-100 transition-colors duration-200 font-medium {$page.url.pathname === link.href ? 'border-b-2 border-white' : ''}"
          >
            {link.label}
          </a>
        {/each}
        
        <!-- Strava Icon -->
        <a 
          href="https://www.strava.com/athletes/33909819" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="text-white hover:text-orange-500 transition-colors duration-200"
          title="Follow me on Strava"
        >
          <svg viewBox="0 0 24 24" class="h-6 w-6 fill-current">
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
          </svg>
        </a>
      </div>

      <!-- Mobile Menu Button -->
      <button
        class="md:hidden text-white hover:text-blue-100 focus:outline-none"
        on:click={toggleMobileMenu}
      >
        <svg
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    </nav>
  </div>

  <!-- Mobile Menu (hidden by default) -->
  <div class="md:hidden {$isMobileMenuOpen ? 'block' : 'hidden'} bg-blue-500 shadow-inner">
    <div class="px-2 pt-2 pb-3 space-y-1">
      {#each navLinks as link}
        <a
          href={link.href}
          class="block px-3 py-2 text-white hover:bg-blue-600 rounded-md {$page.url.pathname === link.href ? 'bg-blue-600' : ''}"
        >
          {link.label}
        </a>
      {/each}
      
      <!-- Strava Icon in Mobile Menu -->
      <a
        href="https://www.strava.com/athletes/33909819"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center px-3 py-2 text-white hover:bg-blue-600 rounded-md"
      >
        <svg viewBox="0 0 24 24" class="h-5 w-5 mr-2 fill-current">
          <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
        </svg>
        <span>Strava</span>
      </a>
    </div>
  </div>
</header>