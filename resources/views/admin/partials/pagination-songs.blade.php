@if ($paginator->hasPages())
    @php
        $itemLabel = $itemLabel ?? 'lagu';
        $chevron = 'M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z';
        $chevronNext = 'M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z';
    @endphp

    {{--
        Scoped, dependency-free stylesheet.

        The admin dashboard ships its own hand-written <style> block and does NOT
        load resources/css/app.css, so Tailwind utilities are inert here. Keep
        this partial self-contained: plain CSS driven by the dashboard :root
        custom properties so every theme (purple/blue/cyberpunk/...) and both
        light/dark modes apply automatically.
    --}}
    @once('admin-pagination-styles')
    <style>
        .spot-pagination {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            gap: 10px 14px;
        }
        .spot-pagination__summary {
            margin: 0;
            font-size: 11px;
            font-family: var(--font-mono);
            color: var(--text-muted);
            white-space: nowrap;
        }
        .spot-pagination__summary strong {
            color: var(--text-main);
            font-weight: 700;
        }
        .spot-pagination__list {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            margin: 0;
            padding: 0;
            list-style: none;
        }
        .spot-pagination__btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            min-width: 28px;
            height: 28px;
            padding: 0 8px;
            border: 1px solid var(--border-subtle);
            border-radius: 8px;
            background: transparent;
            color: var(--text-muted);
            font-family: var(--font-mono);
            font-size: 12px;
            font-weight: 600;
            line-height: 1;
            text-decoration: none;
            white-space: nowrap;
            cursor: pointer;
            transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
        }
        .spot-pagination__btn svg {
            width: 13px;
            height: 13px;
            flex: 0 0 auto;
        }
        a.spot-pagination__btn:hover {
            background: var(--bg-elevated);
            border-color: var(--border-accent);
            color: var(--text-main);
        }
        .spot-pagination__btn:focus-visible {
            outline: 2px solid var(--accent);
            outline-offset: 1px;
        }
        .spot-pagination__btn.is-active {
            background: var(--accent);
            border-color: var(--accent);
            color: #0d0e11;
        }
        .spot-pagination__btn.is-disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }
        .spot-pagination__gap {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 20px;
            height: 28px;
            color: var(--text-muted);
            font-size: 12px;
            user-select: none;
        }

        /* Compact stepper shown on small screens, full page list from 640px up. */
        .spot-pagination__steps {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-left: auto;
        }
        @media (max-width: 639px) {
            .spot-pagination__list { display: none; }
            .spot-pagination__summary { width: 100%; }
        }
        @media (min-width: 640px) {
            .spot-pagination__steps { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
            .spot-pagination__btn { transition: none; }
        }
    </style>
@endonce

    <nav class="spot-pagination" role="navigation" aria-label="Pagination Navigation">
        <p class="spot-pagination__summary">
            @if ($paginator->firstItem())
                Menampilkan <strong>{{ $paginator->firstItem() }}</strong>&ndash;<strong>{{ $paginator->lastItem() }}</strong>
            @else
                Menampilkan <strong>0</strong>
            @endif
            dari <strong>{{ $paginator->total() }}</strong> {{ $itemLabel }}
        </p>

        <ul class="spot-pagination__list">
            <li>
                @if ($paginator->onFirstPage())
                    <span class="spot-pagination__btn is-disabled" aria-disabled="true" aria-label="{{ __('pagination.previous') }}">
                        <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fill-rule="evenodd" d="{{ $chevron }}" clip-rule="evenodd" />
                        </svg>
                    </span>
                @else
                    <a href="{{ $paginator->previousPageUrl() }}" rel="prev" class="spot-pagination__btn" aria-label="{{ __('pagination.previous') }}">
                        <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fill-rule="evenodd" d="{{ $chevron }}" clip-rule="evenodd" />
                        </svg>
                    </a>
                @endif
            </li>

            @foreach ($elements as $element)
                @if (is_string($element))
                    <li><span class="spot-pagination__gap" aria-hidden="true">{{ $element }}</span></li>
                @endif

                @if (is_array($element))
                    @foreach ($element as $page => $url)
                        <li>
                            @if ($page == $paginator->currentPage())
                                <span class="spot-pagination__btn is-active" aria-current="page">{{ $page }}</span>
                            @else
                                <a href="{{ $url }}" class="spot-pagination__btn" aria-label="{{ __('Go to page :page', ['page' => $page]) }}">{{ $page }}</a>
                            @endif
                        </li>
                    @endforeach
                @endif
            @endforeach

            <li>
                @if ($paginator->hasMorePages())
                    <a href="{{ $paginator->nextPageUrl() }}" rel="next" class="spot-pagination__btn" aria-label="{{ __('pagination.next') }}">
                        <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fill-rule="evenodd" d="{{ $chevronNext }}" clip-rule="evenodd" />
                        </svg>
                    </a>
                @else
                    <span class="spot-pagination__btn is-disabled" aria-disabled="true" aria-label="{{ __('pagination.next') }}">
                        <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fill-rule="evenodd" d="{{ $chevronNext }}" clip-rule="evenodd" />
                        </svg>
                    </span>
                @endif
            </li>
        </ul>

        <div class="spot-pagination__steps">
            @if ($paginator->onFirstPage())
                <span class="spot-pagination__btn is-disabled" aria-disabled="true">
                    <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fill-rule="evenodd" d="{{ $chevron }}" clip-rule="evenodd" />
                    </svg>
                    Sebelumnya
                </span>
            @else
                <a href="{{ $paginator->previousPageUrl() }}" rel="prev" class="spot-pagination__btn">
                    <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fill-rule="evenodd" d="{{ $chevron }}" clip-rule="evenodd" />
                    </svg>
                    Sebelumnya
                </a>
            @endif

            @if ($paginator->hasMorePages())
                <a href="{{ $paginator->nextPageUrl() }}" rel="next" class="spot-pagination__btn">
                    Selanjutnya
                    <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fill-rule="evenodd" d="{{ $chevronNext }}" clip-rule="evenodd" />
                    </svg>
                </a>
            @else
                <span class="spot-pagination__btn is-disabled" aria-disabled="true">
                    Selanjutnya
                    <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fill-rule="evenodd" d="{{ $chevronNext }}" clip-rule="evenodd" />
                    </svg>
                </span>
            @endif
        </div>
    </nav>
@endif