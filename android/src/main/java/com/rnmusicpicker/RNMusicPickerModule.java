
package com.rnmusicpicker;

import android.content.ContentUris;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Log;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

public class RNMusicPickerModule extends ReactContextBaseJavaModule {
    private static final String TAG = RNMusicPickerModule.class.getSimpleName();
    private final ReactApplicationContext reactContext;
    private Uri uri3;
    private Callback callback, callbackSave;

    public RNMusicPickerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "RNMusicPicker";
    }

    @ReactMethod
    public void getList(String type, ReadableMap params, Callback callback) {
        this.callback = callback;
        MusicList musicList = new MusicList();
        musicList.execute();
    }

    @ReactMethod
    public void saveList(ReadableArray listSongs, Callback callback) {
        this.callbackSave = callback;
        SaveList saveList = new SaveList();
        saveList.execute(listSongs);
    }

    private class MusicList extends AsyncTask<Void, Void, WritableNativeArray> {

        @Override
        protected WritableNativeArray doInBackground(Void... voids) {
            return getAllAudio();
        }

        @Override
        protected void onPostExecute(WritableNativeArray listMusic) {
            super.onPostExecute(listMusic);
            callback.invoke(null, listMusic);
        }
    }

    private WritableNativeArray getAllAudio() {
        WritableNativeArray writableNativeArray = new WritableNativeArray();

        Uri uri = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI;
        String[] projection = {MediaStore.Audio.AudioColumns.DATA,
                MediaStore.Audio.AudioColumns.TITLE,
                MediaStore.Audio.AudioColumns.ALBUM,
                MediaStore.Audio.ArtistColumns.ARTIST,
                MediaStore.Audio.AudioColumns.DURATION,
                MediaStore.Audio.Media._ID,
                MediaStore.Audio.Albums._ID,
        };

        String[] genresProjection = {
                MediaStore.Audio.Genres.NAME,
                MediaStore.Audio.Genres._ID
        };
        Cursor c = reactContext.getContentResolver().query(uri, projection, null,
                null,
                null);

        if (c != null) {
            while (c.moveToNext()) {
                WritableNativeMap nativeMap = new WritableNativeMap();
                StringBuilder info = new StringBuilder();
                String path = c.getString(0);
                String name = c.getString(1);
                String album = c.getString(2);
                String artist = c.getString(3);
                String duration = c.getString(4);
                String image = c.getString(c.getColumnIndex(MediaStore.Audio.Albums._ID));

                int musicId = Integer.parseInt(c.getString(c
                        .getColumnIndexOrThrow(MediaStore.Audio.Media._ID)));

                Uri sArtworkUri = Uri.parse("content://media/external/audio/albumart");
                uri3 = ContentUris.withAppendedId(sArtworkUri, c.getLong(c
                        .getColumnIndexOrThrow(MediaStore.Audio.Albums._ID)));
                Log.d("Image of Song", "Image :-->" + uri3);


                Uri uri1 = MediaStore.Audio.Genres.getContentUriForAudioId("external", musicId);
                Cursor genresCursor = reactContext.getContentResolver().query(uri1,
                        genresProjection, null, null, null);
                int genre_column_index = 0;
                if (genresCursor != null) {
                    genre_column_index = genresCursor.getColumnIndexOrThrow(MediaStore.Audio.Genres.NAME);
                }

                Log.d("TAG ", "genre_column_index  ----> " + genre_column_index);
                if (genresCursor != null && genresCursor.moveToFirst()) {

                    do {
                        info.append(genresCursor.getString(genre_column_index)).append(" ");

                        System.out.print("genresCursor :" + genresCursor.getString(genre_column_index));
                    } while (genresCursor.moveToNext());
                }
                nativeMap.putString("title", name);
                nativeMap.putString("albumTitle", album);
                nativeMap.putString("albumArtist", artist);
                nativeMap.putString("url", path);
                nativeMap.putString("duration", duration);
                nativeMap.putString("albumArtWork", uri3.toString());
                nativeMap.putString("genre", info.toString());
                nativeMap.putString("lyrics", "");
                nativeMap.putString("playCount", "");
                nativeMap.putString("trackCount", "");
                nativeMap.putString("trackNumber", "");
                nativeMap.putString("rating", "");

                writableNativeArray.pushMap(nativeMap);
            }
            c.close();
        }
        return writableNativeArray;
    }

    private class SaveList extends AsyncTask<ReadableArray, Void, String> {

        @Override
        protected String doInBackground(ReadableArray... readableArrays) {
            ReadableArray listSongs = readableArrays[0];

            File file = new File(reactContext.getExternalFilesDir(Environment.DIRECTORY_MUSIC), ".nomedia");
            if (!file.exists()) {
                try {
                    file.createNewFile();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }

            for (int i = 0; i < listSongs.size(); i++) {
                ReadableMap song = listSongs.getMap(i);
                String path = song.getString("url");
                String filename1 = path.substring(path.lastIndexOf("/") + 1);
                File sourceLocation = new File(path);
                File targetLocation = new File(reactContext.getExternalFilesDir(Environment.DIRECTORY_MUSIC), filename1);
                try {
                    copyFileInAppData(sourceLocation, targetLocation);
                } catch (IOException e) {
                    return e.getLocalizedMessage();
                }
            }
            return "";
        }

        @Override
        protected void onPostExecute(String s) {
            super.onPostExecute(s);
            if (s.equals("")) {
                callbackSave.invoke(null, "Save data success");
            } else {
                callbackSave.invoke(s);
            }
        }
    }

    public void copyFileInAppData(File sourceLocation, File targetLocation) throws IOException {
        if (!targetLocation.exists()) {
            if (sourceLocation.exists()) {

                InputStream in = new FileInputStream(sourceLocation);
                OutputStream out = new FileOutputStream(targetLocation);

                byte[] buf = new byte[1024];
                int len;

                while ((len = in.read(buf)) > 0) {
                    out.write(buf, 0, len);
                }

                in.close();
                out.close();

                Intent mediaScanIntent = new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE);
                Uri contentUri = Uri.fromFile(targetLocation);
                mediaScanIntent.setData(contentUri);
                reactContext.sendBroadcast(mediaScanIntent);

                Log.d(TAG, "Copy file successful.");
            }
        }
    }
}