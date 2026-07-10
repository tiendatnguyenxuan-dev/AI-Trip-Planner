package com.example.tripplanner.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Generic response wrapper for cursor-based pagination.
 *
 * Cursor pagination avoids OFFSET which degrades at scale.
 * Instead, the client sends the last item's cursor (ID or timestamp)
 * and the server returns the next page starting after that cursor.
 *
 * Usage example:
 *   GET /api/v1/trips/history?cursor=&lt;lastTripId&gt;&amp;size=10
 *
 * @param <T> the type of items in the page
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CursorPageResponse<T> {

    /** The items in this page. */
    private List<T> items;

    /**
     * The cursor to use for the next page request.
     * Null when hasMore is false (no more data).
     */
    private String nextCursor;

    /** True if there are more items after this page. */
    private boolean hasMore;

    /** Total count — optional, included when feasible (cheap COUNT query). */
    private Long totalCount;

    public static <T> CursorPageResponse<T> of(List<T> items, String nextCursor, boolean hasMore) {
        return CursorPageResponse.<T>builder()
                .items(items)
                .nextCursor(nextCursor)
                .hasMore(hasMore)
                .build();
    }
}
