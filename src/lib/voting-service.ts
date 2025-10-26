
import { table, supabase } from './backend';
import type { IssueVote, VoteType } from '../types/issue';

// Use human-readable table names for Supabase
const VOTES_TABLE_ID = 'votes';
const ISSUES_TABLE_ID = 'issues';

// Get vote count for a specific issue
export async function getIssueVoteCount(issueId: string): Promise<{ upvotes: number; downvotes: number; total: number }> {
  try {
    // Use RPC to get current counts atomically
    const { data, error } = await supabase.rpc('get_issue_vote_counts', { p_issue_id: issueId });
    if (error) throw error;
    const row = data?.[0] || data;
    return {
      upvotes: row?.upvotes || 0,
      downvotes: row?.downvotes || 0,
      total: row?.total || 0
    };
  } catch (error) {
    console.error('Error fetching vote count:', error);
    return { upvotes: 0, downvotes: 0, total: 0 };
  }
}

// Get user's vote for a specific issue
export async function getUserVote(issueId: string, userId: string): Promise<VoteType | null> {
  try {
    // Query votes for this user and issue directly
    const response = await table.getItems(VOTES_TABLE_ID, {
      query: { user_id: userId, issue_id: issueId }
    });
    const rows = response.items as IssueVote[];
    const vote = rows?.[0];
    return vote?.vote_type || null;
  } catch (error) {
    console.error('Error fetching user vote:', error);
    return null;
  }
}

// Cast or update a vote
export async function castVote(issueId: string, userId: string, voteType: VoteType): Promise<boolean> {
  try {
  // Call server-side RPC to perform atomic insert/update/delete and update counts
  const { data, error } = await supabase.rpc('cast_vote', { p_issue_id: issueId, p_user_id: userId, p_vote_type: voteType });
  if (error) throw error;
  return true;
  } catch (error) {
    console.error('Error casting vote:', error);
    return false;
  }
}

// Remove a user's vote
export async function removeVote(issueId: string, userId: string): Promise<boolean> {
  try {
  // Use RPC to toggle/remove vote by calling cast_vote with existing type (RPC handles toggle)
  const { data, error } = await supabase.rpc('cast_vote', { p_issue_id: issueId, p_user_id: userId, p_vote_type: 'toggle_off' });
  if (error) throw error;
  return true;
  } catch (error) {
    console.error('Error removing vote:', error);
    return false;
  }
}

// Update the vote count and community priority for an issue
async function updateIssueVoteCount(issueId: string): Promise<void> {
  try {
  // With RPC approach, the DB updates the issue counts. No client-side update required.
  return;
  } catch (error) {
    console.error('Error updating issue vote count:', error);
  }
}

// Get top voted issues
export async function getTopVotedIssues(limit: number = 10) {
  try {
    const response = await table.getItems(ISSUES_TABLE_ID, {});
    const issues = response.items;
    
    return issues
      .filter(issue => issue.voteCount > 0)
      .sort((a, b) => (b.communityPriority || 0) - (a.communityPriority || 0))
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching top voted issues:', error);
    return [];
  }
}
