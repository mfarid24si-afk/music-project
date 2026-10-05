@if ($paginator->hasPages())
    <nav role="navigation" aria-label="{{ __('Pagination Navigation') }}" style="margin-top: 20px;">
        <!-- Mobile -->
        <div class="flex gap-2 items-center justify-between sm:hidden">
            @if ($paginator->onFirstPage())
                <span class="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border"
                      style="color: var(--text-muted); background: var(--bg-surface); border-color: var(--border-subtle); cursor: not-allowed; opacity: .6;">
                    &laquo; Sebelumnya
                </span>
            @else
                <a href="{{ $paginator->previousPageUrl() }}" rel="prev"
                   class="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border transition"
                   style="color: var(--text-main); background: var(--bg-surface); border-color: var(--border-subtle);"
                   onmouseover="this.style.background='var(--bg-elevated)'" onmouseout="this.style.background='var(--bg-surface)'">
                    &laquo; Sebelumnya
                </a>
            @endif

            @if ($paginator->hasMorePages())
                <a href="{{ $paginator->nextPageUrl() }}" rel="next"
                   class="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border transition"
                   style="color: var(--text-main); background: var(--bg-surface); border-color: var(--border-subtle);"
                   onmouseover="this.style.background='var(--bg-elevated)'" onmouseout="this.style.background='var(--bg-surface)'">
                    Selanjutnya &raquo;
                </a>
            @else
                <span class="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border"
                      style="color: var(--text-muted); background: var(--bg-surface); border-color: var(--border-subtle); cursor: not-allowed; opacity: .6;">
                    Selanjutnya &raquo;
                </span>
            @endif
        </div>

        <!-- Desktop -->
        <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
                <p class="text-xs leading-5" style="color: var(--text-muted);">
                    Menampilkan
                    @if ($paginator->firstItem())
                        <span style="color: var(--text-main); font-weight: 600;">{{ $paginator->firstItem() }}</span>
                        –
                        <span style="color: var(--text-main); font-weight: 600;">{{ $paginator->lastItem() }}</span>
                    @else
                        {{ $paginator->count() }}
                    @endif
                    dari
                    <span style="color: var(--text-main); font-weight: 600;">{{ $paginator->total() }}</span>
                    lagu
                </p>
            </div>

            <div>
                <span class="inline-flex items-center gap-px rounded-lg overflow-hidden border"
                      style="border-color: var(--border-subtle); box-shadow: none;">
                    {{-- Previous --}}
                    @if ($paginator->onFirstPage())
                        <span aria-disabled="true" aria-label="{{ __('pagination.previous') }}"
                              class="inline-flex items-center px-2.5 py-1.5 text-xs"
                              style="color: var(--text-muted); background: var(--bg-surface); cursor: not-allowed; opacity: .55;">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                            </svg>
                        </span>
                    @else
                        <a href="{{ $paginator->previousPageUrl() }}" rel="prev" aria-label="{{ __('pagination.previous') }}"
                           class="inline-flex items-center px-2.5 py-1.5 text-xs transition"
                           style="color: var(--text-main); background: var(--bg-surface);"
                           onmouseover="this.style.background='var(--bg-elevated)'" onmouseout="this.style.background='var(--bg-surface)'">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                            </svg>
                        </a>
                    @endif

                    {{-- Elements --}}
                    @foreach ($elements as $element)
                        @if (is_string($element))
                            <span aria-disabled="true"
                                  class="inline-flex items-center px-3 py-1.5 text-xs -ml-px"
                                  style="color: var(--text-muted); background: var(--bg-surface);">
                                {{ $element }}
                            </span>
                        @endif

                        @if (is_array($element))
                            @foreach ($element as $page => $url)
                                @if ($page == $paginator->currentPage())
                                    <span aria-current="page"
                                          class="inline-flex items-center px-3 py-1.5 text-xs -ml-px font-semibold"
                                          style="color: #0d0e11; background: var(--accent); border-left: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);">
                                        {{ $page }}
                                    </span>
                                @else
                                    <a href="{{ $url }}" aria-label="{{ __('Go to page :page', ['page' => $page]) }}"
                                       class="inline-flex items-center px-3 py-1.5 text-xs -ml-px transition"
                                       style="color: var(--text-main); background: var(--bg-surface);"
                                       onmouseover="this.style.background='var(--bg-elevated)'" onmouseout="this.style.background='var(--bg-surface)'">
                                        {{ $page }}
                                    </a>
                                @endif
                            @endforeach
                        @endif
                    @endforeach

                    {{-- Next --}}
                    @if ($paginator->hasMorePages())
                        <a href="{{ $paginator->nextPageUrl() }}" rel="next" aria-label="{{ __('pagination.next') }}"
                           class="inline-flex items-center px-2.5 py-1.5 text-xs -ml-px transition"
                           style="color: var(--text-main); background: var(--bg-surface);"
                           onmouseover="this.style.background='var(--bg-elevated)'" onmouseout="this.style.background='var(--bg-surface)'">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                            </svg>
                        </a>
                    @else
                        <span aria-disabled="true" aria-label="{{ __('pagination.next') }}"
                              class="inline-flex items-center px-2.5 py-1.5 text-xs -ml-px"
                              style="color: var(--text-muted); background: var(--bg-surface); cursor: not-allowed; opacity: .55;">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                            </svg>
                        </span>
                    @endif
                </span>
            </div>
        </div>
    </nav>
@endif
