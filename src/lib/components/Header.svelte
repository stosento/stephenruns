<script lang="ts">
    import { page } from '$app/stores';
    
    interface NavLink {
      href: string;
      label: string;
    }
  
    const navLinks: NavLink[] = [
      { href: '/', label: 'Home' },
      { href: '#calendar', label: 'Calendar' },
      { href: '/routes', label: 'Routes' },
      { href: '/faq', label: 'FAQ' }
    ];
  </script>
  
  <header class="bg-blue-500 shadow-md">
    <div class="container mx-auto px-4">
      <nav class="flex items-center justify-between h-20">
        <!-- Logo/Brand -->
        <div class="flex items-center">
          <a href="/" class="text-white text-2xl font-bold">
            RunWithStephen
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
        </div>
  
        <!-- Mobile Menu Button -->
        <button
          class="md:hidden text-white hover:text-blue-100 focus:outline-none"
          on:click={() => {/* Toggle mobile menu */}}
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
    <div class="md:hidden hidden">
      <div class="px-2 pt-2 pb-3 space-y-1">
        {#each navLinks as link}
          <a
            href={link.href}
            class="block px-3 py-2 text-white hover:bg-blue-600 rounded-md {$page.url.pathname === link.href ? 'bg-blue-600' : ''}"
          >
            {link.label}
          </a>
        {/each}
      </div>
    </div>
  </header>