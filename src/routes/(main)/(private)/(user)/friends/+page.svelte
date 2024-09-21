<script>
    // #region Imports

    // Import svgs
    import UserAdd from "$lib/assets/svgs/UserAdd.svelte"
    import Search from "$lib/assets/svgs/Search.svelte"
    import Close from "$lib/assets/svgs/Close.svelte"
    import ArrowPrev from "$lib/assets/svgs/ArrowPrev.svelte"
    import ArrowNext from "$lib/assets/svgs/ArrowNext.svelte"

    // Import components
    import Banner from "$lib/components/Banner.svelte"
    import AutoScroll from "$lib/components/AutoScroll.svelte"
    import LoadingAnimation from "$lib/components/LoadingAnimation.svelte"

    /*
        https://kit.svelte.dev/docs/modules#$app-stores-page
        Store containing page information
    */
    import { page } from "$app/stores"

    /*
        https://kit.svelte.dev/docs/form-actions#progressive-enhancement-use-enhance
        Form action to improve the default behaviour of form elements
    */
    import { enhance } from "$app/forms"
    // #endregion



    // Object containing all search information
    const search = {
        value: "",
        result: null,
        loading: false
    }

    /*
        `boolean` indicating if the received friend 
        requests pane is shown. Otherwise show sent 
        friend request pane.
    */
    let showReceived = true



    // #region Form Submissions
        // #region submit_sendFriendRequest
    /**
     * Form submit function to send a `POST` request to
     * an endpoint that sends a friend request to another `User`
     * https://kit.svelte.dev/docs/types#public-types-submitfunction
     * 
     * 
     * @param {{
	        action: URL,
	        formData: FormData,
	        formElement: HTMLFormElement,
	        controller: AbortController,
	        submitter: HTMLElement | null,
	        cancel(): void
        }} submissionDetails
     *
     * @param {String} username - The username of a `User` 
       entry to send friend request.
     *
     *
     * @returns {
            ((options: {
                formData: FormData,
                formElement: HTMLFormElement,
                action: URL,
                result: import("@sveltejs/kit").ActionResult<Success, Failure>,
                update(options?: {
                    reset?: Boolean,
                    invalidateAll?: Boolean
                }): Promise<void>
            }) => void)
        }
     */
    const submit_sendFriendRequest = ({ formData }, username) => {
        // Add username to `formData`
        formData.append("username", username)

        // Submit form
        return async ({ result, update }) => {
            // If success
            if (result.data?.status === 200) {
                /*
                    If `username` is the username of any `User` 
                    entry that has been returned in the search result.
                */
                if (search.result?.users?.[username]) {
                    // Update search results to reflect change
                    search.result.users[username].sent = true
                }
            }
            await update()
        }
    }
        // #endregion


        // #region submit_cancelFriendRequest
    /**
     * Form submit function to send a `POST` request to
     * an endpoint that cancels a friend request to another `User`
     * https://kit.svelte.dev/docs/types#public-types-submitfunction
     * 
     * 
     * @param {{
	        action: URL,
	        formData: FormData,
	        formElement: HTMLFormElement,
	        controller: AbortController,
	        submitter: HTMLElement | null,
	        cancel(): void
        }} submissionDetails
     *
     * @param {String} username - The username of a `User` 
       entry to send friend request.
     *
     *
     * @returns {
            ((options: {
                formData: FormData,
                formElement: HTMLFormElement,
                action: URL,
                result: import("@sveltejs/kit").ActionResult<Success, Failure>,
                update(options?: {
                    reset?: Boolean,
                    invalidateAll?: Boolean
                }): Promise<void>
            }) => void)
        }
     */
     const submit_cancelFriendRequest = ({ formData }, username) => {
        // Add username to `formData`
        formData.append("username", username)

        // Submit form
        return async ({ result, update }) => {
            // If success
            if (result.data?.status === 200) {
                /*
                    If `username` is the username of any `User` 
                    entry that has been returned in the search result.
                */
                if (search.result?.users?.[username]) {
                    // Update search results to reflect change
                    search.result.users[username].sent = false
                }
            }
            await update()
        }
    }
        // #endregion
    // #endregion



    /*
        https://kit.svelte.dev/docs/load#$page-data
        Get data from load subroutines
    */
    $: data = $page.data
</script>

<Banner>
    <UserAdd slot="svg"/>
    <h4>Friends</h4>
    <AutoScroll>
        <h6>Send and manage friend requests.</h6>
    </AutoScroll>
</Banner>

<div class="page">
    <div class="widthCtrl">
        <div class="group">
            <div class="searchBar">
                <Search/>
                <!-- Bind value to `search.value` so it can be accessed by the script -->
                <input class="search" name="search" placeholder="Search for friends..."
                    bind:value={search.value}
                    on:input={async () => {
                        // Get the `searchValue` when the input was made
                        const initVal = search.value

                        // If the value is empty, return
                        if (initVal === "") {
                            search.result = null
                            return
                        }

                        // Set to true so loading indicator is displayed
                        search.loading = true

                        // Wait 1 second to allow the client to continue typing
                        await new Promise(resolve => setTimeout(resolve, 1000))

                        // If the value has changed, the client is not finished typing so return
                        if (initVal !== search.value) return

                        // Send a request to fetch search results from api endpoint
                        const response = await fetch($page.url.pathname, {
                            method: "POST",
                            body: JSON.stringify({
                                search: search.value
                            }),
                            headers: {
                                /*
                                    TODO: Move the contents of `./+server.js` into 
                                    a form action and use
                                    "x-sveltekit-action": "true"
                                */
                                "Content-Type": "application/json"
                            }
                        })

                        // Set `search.result` to the returned users or an empty array
                        search.result = (await response.json()) || null

                        // Set false when search has loaded
                        search.loading = false
                    }}
                >
            </div>
            <!-- Display if client has entered a value in the search input  -->
            {#if search.value}
                <!-- Display if server has returned a search result  -->
                {#if Object.entries(search.result?.users || {}).length > 0}
                    <div class="block users" class:loading={search.loading}>
                        <!-- Create a user for every item in `search.result` -->
                        {#each Object.entries(search.result.users) as [username, status]}
                            <div class="user">
                                <div class="profile">
                                    <h6>{username}</h6>
                                </div>
                                <!-- Display if client has not sent friend request to this user  -->
                                {#if !status.sent}
                                    <form method="POST" action="?/sendFriendRequest"
                                        use:enhance={(submissionDetails) => { 
                                            return submit_sendFriendRequest(submissionDetails, username) 
                                        }}
                                    >
                                        <button class="button-pill" type="submit">
                                            <UserAdd/>
                                            <h6>Add</h6>
                                        </button>
                                    </form>
                                <!-- Display if client has sent friend request to this user  -->
                                {:else}
                                    <form method="POST" action="?/cancelFriendRequest"
                                        use:enhance={(submissionDetails) => {
                                            return submit_cancelFriendRequest(submissionDetails, username)
                                        }}
                                    >
                                        <button class="button-slim button-svg" type="submit">
                                            <Close/>
                                        </button>
                                    </form>
                                    <button class="button-pill disabled" type="button">
                                        <UserAdd/>
                                        <h6>Add</h6>
                                    </button>
                                {/if}
                            </div>
                        {/each}
                    </div>
                {:else}
                    <div class="noResult">
                        <!-- Display if server has not returned a response  -->
                        {#if search.loading}
                            <LoadingAnimation/>
                        {:else}
                            <!-- Display if server has returned a response with no results  -->
                            <h6>No results</h6>
                        {/if}
                    </div>
                {/if}
            {/if}
        </div>
        <div class="group">
            <!-- Buttons to select which pane to show -->
            <div class="paneOptions thickFW">
                <button on:click={() => { showReceived = true }} class:dim={!showReceived}>
                    <ArrowPrev/>
                    <h6>Requests received</h6>
                </button>
                <button on:click={() => { showReceived = false }} class:dim={showReceived}>
                    <h6>Requests sent</h6>
                    <ArrowNext/>
                </button>
            </div>
            <!-- Display if `showReceived`  -->
            {#if showReceived}
                <!-- Display if client has received pending friend requests  -->
                {#if data.friendRequests.pendingReceived > 0}
                    <div class="block users">
                        <!-- Create a user for every item in `friendRequests.users` -->
                        {#each Object.entries(data.friendRequests.users) as [username, status]}
                            <!-- Display if client has not sent, but has received friend request from this user -->
                            {#if !status.sent && status.received}
                                <div class="user">
                                    <div class="profile">
                                        <h6>{username}</h6>
                                    </div>
                                    <button class="button-slim button-svg" type="submit">
                                        <Close/>
                                    </button>
                                    <form method="POST" action="?/sendFriendRequest"
                                        use:enhance={(submissionDetails) => {
                                            return submit_sendFriendRequest(submissionDetails, username)
                                        }}
                                    >
                                        <button class="button-pill" type="submit">
                                            <UserAdd/>
                                            <h6>Add</h6>
                                        </button>
                                    </form>
                                </div>
                            {/if}
                        {/each}
                    </div>
                {:else}
                    <div class="block padded">
                        <h6>You haven't received any friend requests</h6>
                    </div>
                {/if}
            <!-- Display if not `showReceived`  -->
            {:else}
                <!-- Display if client has sent pending friend requests  -->
                {#if data.friendRequests.pendingSent > 0}
                    <div class="block users">
                        <!-- Create a user for every item in `friendRequests.users` -->
                        {#each Object.entries(data.friendRequests.users) as [username, status]}
                            <!-- Display if client has sent, but has not received friend request from this user -->
                            {#if status.sent && !status.received}
                                <div class="user">
                                    <div class="profile">
                                        <h6>{username}</h6>
                                    </div>
                                    <form method="POST" action="?/cancelFriendRequest"
                                        use:enhance={(submissionDetails) => {
                                            return submit_cancelFriendRequest(submissionDetails, username)
                                        }}
                                    >
                                        <button class="button-slim button-svg" type="submit">
                                            <Close/>
                                        </button>
                                    </form>
                                    <button class="button-pill disabled" type="button">
                                        <UserAdd/>
                                        <h6>Add</h6>
                                    </button>
                                </div>
                            {/if}
                        {/each}
                    </div>
                {:else}
                    <div class="block padded">
                        <h6>You haven't sent any friend requests</h6>
                    </div>
                {/if}
            {/if}
        </div>
        <div class="group">
            <h6 class="thickFW">Friends</h6>
            {#if data.friendRequests.friendCount > 0}
                <div class="block users">
                    <!-- Create a user for every item in `friendRequests.users` -->
                    {#each Object.entries(data.friendRequests.users) as [username, status]}
                        <!-- Display if client has sent, and has received friend request from this user -->
                        {#if status.sent && status.received}
                            <div class="user">
                                <div class="profile">
                                    <h6>{username}</h6>
                                </div>
                                <form method="POST" action="?/cancelFriendRequest"
                                    use:enhance={(submissionDetails) => {
                                        return submit_cancelFriendRequest(submissionDetails, username)
                                    }}
                                >
                                    <button class="button-slim button-svg" type="submit">
                                        <Close/>
                                    </button>
                                </form>
                                <button class="button-pill disabled" type="button">
                                    <UserAdd/>
                                    <h6>Add</h6>
                                </button>
                            </div>
                        {/if}
                    {/each}
                </div>
            {:else}
                <div class="block padded">
                    <h6>You have no friends</h6>
                </div>
            {/if}
        </div>
    </div>
</div>

<style lang="scss">

    .page {
        display: flex;
        align-items: center;
        justify-content: baseline;
        flex-direction: column;

        gap: 3rem;
    }

    .group {
        width: 100%;

        display: flex;
        align-items: center;
        flex-direction: column;

        gap: 1rem;
    }



    .searchBar {
        width: 100%;
        border-radius: 1000px;
        
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;

        background-color: var(--bg-4);

        >:global(svg) {
            margin-left: 2px;
            height: 1.25rem;
        }

        >.search {
            margin-right: 2px;
            width: 100%;
            border: none;
        }
    }

    .noResult {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;

        height: 2.5rem;

        >:global(.animation) {
            color: var(--br-3);
            height: 100%;
        }
    }



    .paneOptions {
        width: 100%;

        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;

        >button {
            display: flex;
            align-items: center;

            >:global(svg) {
                height: 1rem;
            }
        }

        .dim {
            color: var(--tx-4);
        }
    }



    .block {
        width: 100%;
        padding: 0;

        &.padded {
            width: 100%;
            display: flex;
            align-items: center;
           justify-content: center;

       
           >* {
                padding: 1rem;
           }
        }
    }

    .users {
        gap: 0;

        &.loading {
            opacity: 0.5;
            // Slowly fade out but instantly fade in
            transition: opacity 200ms ease-in-out;
        }

        >.user {
            position: relative;
            --space: 1rem;

            padding: 0 var(--space);
            margin-top: var(--space);
            margin-bottom: var(--space);

            display: flex;
            align-items: center;
            flex-direction: row;

            gap: 1rem;

            >.profile {
                flex-grow: 1;
            }

            .button-pill {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
            }

            :global(svg) {
                height: 1.25rem;
            }
        }

        >.user + .user {
          
            &::before {
                content: "";
                position: absolute;
                left: 0;
                right: 0;

                --size: 1px;
                height: var(--size);
                top: calc(-1 * (var(--space) + var(--size) / 2));

                background-color: var(--bg-4);
            }
        }
    }

    form {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    // IMPROVE: only show 3 user entries at a time unless "Show more" button is clicked
    // IMPROVE: overall styling for this page
</style>