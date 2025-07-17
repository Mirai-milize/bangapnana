const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

exports.handler = async (event, context) => {
  if (event.httpMethod === 'GET') {
    try {
      const { data, error } = await supabase
        .from('counts')
        .select('value')
        .single();

      if (error) {
        console.error('Error fetching count:', error);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Failed to fetch count' }),
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ count: data ? data.value : 0 }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      };
    } catch (e) {
      console.error('Exception fetching count:', e);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
      };
    }
  } else if (event.httpMethod === 'POST') {
    try {
      // 현재 카운트 가져오기
      const { data: currentData, error: fetchError } = await supabase
        .from('counts')
        .select('value')
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine for initial setup
        console.error('Error fetching current count for update:', fetchError);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Failed to fetch current count for update' }),
        };
      }

      let newCount = (currentData ? currentData.value : 0) + 1;

      // 카운트 업데이트 (upsert를 사용하여 행이 없으면 삽입, 있으면 업데이트)
      const { data, error: updateError } = await supabase
        .from('counts')
        .upsert({ id: 1, value: newCount }, { onConflict: 'id' }) // Assuming id:1 is the single row for global count
        .select();

      if (updateError) {
        console.error('Error updating count:', updateError);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Failed to update count' }),
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ count: newCount }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      };
    } catch (e) {
      console.error('Exception updating count:', e);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
      };
    }
  }

  return {
    statusCode: 405,
    body: 'Method Not Allowed',
  };
};
